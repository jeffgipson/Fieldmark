# frozen_string_literal: true

require "net/http"
require "json"

module Location
  # OpenStreetMap farmland / field polygons (free, community-mapped).
  class OsmBoundaryFetcher
    LANDUSE_PATTERN = "farmland|meadow|orchard|vineyard|farmyard|plant_nursery|crop|greenhouse"
    RELATION_LANDUSE_PATTERN = "farmland|meadow|orchard|vineyard|crop"
    OVERPASS_ENDPOINTS = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.openstreetmap.ru/api/interpreter"
    ].freeze

    Candidate = Struct.new(
      :id, :source, :label, :acres, :distance_m, :contains_point, :boundary, keyword_init: true
    )

    def self.call(latitude:, longitude:, radius_m: 600)
      new(latitude: latitude, longitude: longitude, radius_m: radius_m).call
    end

    def self.call_bbox(south:, west:, north:, east:, latitude: nil, longitude: nil)
      lat = latitude&.to_f || (south.to_f + north.to_f) / 2.0
      lng = longitude&.to_f || (west.to_f + east.to_f) / 2.0
      new(bbox: [south, west, north, east], latitude: lat, longitude: lng).call
    end

    def initialize(latitude: nil, longitude: nil, radius_m: 600, bbox: nil)
      @latitude = latitude&.to_f
      @longitude = longitude&.to_f
      @radius_m = radius_m.to_i.clamp(100, 1_200)
      @bbox = bbox
    end

    def call
      cache_key = cache_key_for_query
      cached = Rails.cache.read(cache_key)
      return cached if cached.is_a?(Array)

      elements = fetch_overpass
      result = build_candidates(elements)
      Rails.cache.write(cache_key, result, expires_in: 3.days) if result.present?
      result
    rescue StandardError => e
      Rails.logger.warn("[OsmBoundaryFetcher] #{e.class}: #{e.message}")
      []
    end

    private

    def cache_key_for_query
      if @bbox
        "osm:boundaries:bbox:#{@bbox.map { |v| v.to_f.round(4) }.join(':')}"
      else
        "osm:boundaries:pt:#{@latitude.round(4)}:#{@longitude.round(4)}:#{@radius_m}"
      end
    end

    def overpass_ql
      if @bbox
        south, west, north, east = @bbox
        bbox = "#{south},#{west},#{north},#{east}"
        <<~QL.squish
          [out:json][timeout:20];
          (
            way[landuse~"#{LANDUSE_PATTERN}"](#{bbox});
            way["crop"](#{bbox});
            relation[landuse~"#{RELATION_LANDUSE_PATTERN}"](#{bbox});
          );
          out geom;
        QL
      else
        <<~QL.squish
          [out:json][timeout:20];
          (
            way[landuse~"#{LANDUSE_PATTERN}"](around:#{@radius_m},#{@latitude},#{@longitude});
            way["crop"](around:#{@radius_m},#{@latitude},#{@longitude});
            relation[landuse~"#{RELATION_LANDUSE_PATTERN}"](around:#{@radius_m},#{@latitude},#{@longitude});
          );
          out geom;
        QL
      end
    end

    def fetch_overpass
      OVERPASS_ENDPOINTS.each do |url|
        body = post_overpass(url)
        next if body.blank?

        parsed = JSON.parse(body)
        return parsed["elements"] if parsed["elements"].is_a?(Array)
      rescue JSON::ParserError, Net::OpenTimeout, Net::ReadTimeout, SocketError,
             Errno::ECONNRESET, Errno::ECONNREFUSED => e
        Rails.logger.warn("[OsmBoundaryFetcher] #{url}: #{e.class} #{e.message}")
        next
      end
      Rails.logger.warn("[OsmBoundaryFetcher] all Overpass endpoints failed — outlines unavailable")
      []
    end

    def post_overpass(url)
      uri = URI(url)
      Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 4, read_timeout: 14) do |http|
        request = Net::HTTP::Post.new(uri)
        request["Content-Type"] = "application/x-www-form-urlencoded"
        request["User-Agent"] = Location::ReverseGeocoder::USER_AGENT
        request.body = URI.encode_www_form(data: overpass_ql)
        response = http.request(request)
        return nil unless response.is_a?(Net::HTTPSuccess)

        response.body
      end
    end

    def build_candidates(elements)
      elements
        .filter_map { |el| element_to_candidate(el) }
        .sort_by { |c| [c.contains_point ? 0 : 1, c.distance_m] }
        .first(25)
    end

    def element_to_candidate(element)
      case element["type"]
      when "way"
        way_to_candidate(element)
      when "relation"
        relation_to_candidate(element)
      end
    end

    def way_to_candidate(way)
      ring = ring_from_geometry(way["geometry"])
      return nil unless ring

      candidate_from_ring(ring, id: "osm-way-#{way['id']}", tags: way["tags"] || {})
    end

    def relation_to_candidate(relation)
      ring = ring_from_geometry(relation["geometry"])
      return nil unless ring

      candidate_from_ring(ring, id: "osm-relation-#{relation['id']}", tags: relation["tags"] || {})
    end

    def ring_from_geometry(geometry)
      return nil unless geometry.is_a?(Array) && geometry.size >= 4

      ring = geometry.map { |node| [node["lon"].to_f, node["lat"].to_f] }
      ring << ring.first unless ring.first == ring.last
      ring.size >= 4 ? ring : nil
    end

    def candidate_from_ring(ring, id:, tags:)
      boundary = { "type" => "Polygon", "coordinates" => [ring] }
      acres = PolygonArea.acres_from_geojson(boundary)
      contains = @latitude && @longitude ? point_in_polygon?(@longitude, @latitude, ring) : false
      distance = if @latitude && @longitude
                   distance_to_ring_m(@latitude, @longitude, ring)
                 else
                   0
                 end

      Candidate.new(
        id: id,
        source: "openstreetmap",
        label: label_for(tags),
        acres: acres,
        distance_m: distance.round(1),
        contains_point: contains,
        boundary: boundary
      )
    end

    def label_for(tags)
      landuse = tags["landuse"] || tags["crop"] || "field"
      name = tags["name"]
      name.present? ? "#{name} (#{landuse})" : landuse.to_s.tr("_", " ").capitalize
    end

    def point_in_polygon?(lng, lat, ring)
      inside = false
      j = ring.length - 1
      ring.each_with_index do |(xi, yi), i|
        xj, yj = ring[j]
        denom = (yj - yi)
        next if denom.zero?

        intersect = ((yi > lat) != (yj > lat)) &&
                    (lng < ((xj - xi) * (lat - yi) / denom) + xi)
        inside = !inside if intersect
        j = i
      end
      inside
    end

    def distance_to_ring_m(lat, lng, ring)
      # Distance from point to nearest vertex (approximate; good enough for sorting).
      ring.map do |lon, node_lat|
        haversine_m(lat, lng, node_lat, lon)
      end.min
    end

    def haversine_m(lat1, lon1, lat2, lon2)
      r = 6_378_137.0
      dlat = (lat2 - lat1) * Math::PI / 180
      dlon = (lon2 - lon1) * Math::PI / 180
      a = Math.sin(dlat / 2)**2 +
          Math.cos(lat1 * Math::PI / 180) * Math.cos(lat2 * Math::PI / 180) * Math.sin(dlon / 2)**2
      2 * r * Math.asin(Math.sqrt(a))
    end
  end
end
