# frozen_string_literal: true

require "net/http"
require "json"

module Location
  # County parcel boundaries (requires REGRID_API_KEY — https://regrid.com/api).
  # Trial/sandbox tokens only return parcels in Regrid's limited demo counties (see REGRID_TRIAL_COUNTIES).
  class RegridBoundaryFetcher
    API_BASE = "https://app.regrid.com/api/v2/parcels/point"

    # Documented in Regrid OpenAPI v2 — trial tokens are restricted to seven counties.
    # Examples: Dallas TX (32.83, -96.56), Marion IN (/us/in/marion).
    TRIAL_SAMPLE_LAT = 32.834967
    TRIAL_SAMPLE_LON = -96.563861

    def self.call(latitude:, longitude:, radius_m: 150)
      return [] unless AppConfig.regrid_api_key.present?

      new(latitude: latitude, longitude: longitude, radius_m: radius_m).call
    end

    def self.trial_token?
      AppConfig.regrid_api_key.present?
    end

    def initialize(latitude:, longitude:, radius_m: 150)
      @latitude = latitude.to_f
      @longitude = longitude.to_f
      @radius_m = radius_m.to_i.clamp(10, 1_000)
    end

    def call
      cache_key = "regrid:parcels:v2:#{@latitude.round(5)}:#{@longitude.round(5)}:#{@radius_m}"
      cached = Rails.cache.read(cache_key)
      return cached if cached.is_a?(Array)

      result = fetch_parcels
      Rails.cache.write(cache_key, result, expires_in: 7.days) if result.present?
      result
    rescue StandardError => e
      Rails.logger.warn("[RegridBoundaryFetcher] #{e.class}: #{e.message}")
      []
    end

    private

    def fetch_parcels
      uri = URI(API_BASE)
      uri.query = URI.encode_www_form(
        lat: @latitude,
        lon: @longitude,
        radius: @radius_m,
        limit: 20,
        return_geometry: true,
        token: AppConfig.regrid_api_key
      )

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 8, read_timeout: 20) do |http|
        request = Net::HTTP::Get.new(uri)
        request["User-Agent"] = Location::ReverseGeocoder::USER_AGENT
        request["Accept"] = "application/json"
        http.request(request)
      end

      unless response.is_a?(Net::HTTPSuccess)
        Rails.logger.warn("[RegridBoundaryFetcher] HTTP #{response.code}: #{response.body.to_s[0, 200]}")
        return []
      end

      body = JSON.parse(response.body)
      features = body.dig("parcels", "features") || body["features"] || []
      if features.empty?
        Rails.logger.info(
          "[RegridBoundaryFetcher] 0 parcels at #{@latitude},#{@longitude} — " \
          "trial tokens are limited to Regrid demo counties (not all of MO)"
        )
      end

      features.filter_map { |feature| feature_to_candidate(feature) }
    end

    def feature_to_candidate(feature)
      geometry = feature["geometry"]
      return nil if geometry.blank?

      boundary = geometry["type"] == "Polygon" ? geometry : flatten_multipolygon(geometry)
      return nil unless boundary

      props = feature["properties"] || {}
      fields = props["fields"] || props
      acres = fields["ll_gisacre"] || fields["gisacre"] || fields["acreage"]
      acres = acres.to_f.round(1) if acres.present?
      acres ||= PolygonArea.acres_from_geojson(boundary)

      label = props["headline"].presence ||
              fields["address"].presence ||
              fields["owner"].presence ||
              fields["parcelnumb"].presence ||
              "Parcel"

      Location::OsmBoundaryFetcher::Candidate.new(
        id: "regrid-#{fields['ll_uuid'] || props['ll_uuid'] || SecureRandom.hex(4)}",
        source: "regrid",
        label: label.to_s,
        acres: acres,
        distance_m: 0,
        contains_point: true,
        boundary: boundary
      )
    end

    def flatten_multipolygon(geometry)
      return geometry if geometry["type"] == "Polygon"
      return nil unless geometry["type"] == "MultiPolygon"

      polys = geometry["coordinates"]
      return nil if polys.blank?

      { "type" => "Polygon", "coordinates" => polys.first }
    end
  end
end
