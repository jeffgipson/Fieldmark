# frozen_string_literal: true

module Location
  # GeoJSON polygon coordinates: [lng, lat] rings; first ring is exterior.
  # Geodesic area on the WGS84 sphere (adequate for field-scale boundaries).
  class PolygonArea
    SQ_METERS_PER_ACRE = 4_046.8564224
    EARTH_RADIUS_M = 6_378_137.0

    def self.acres_from_geojson(geojson)
      sq_meters = sq_meters_from_geojson(geojson)
      return nil unless sq_meters&.positive?

      (sq_meters / SQ_METERS_PER_ACRE).round(1)
    end

    def self.sq_meters_from_geojson(geojson)
      return nil if geojson.blank?

      geometry = geojson.is_a?(Hash) ? geojson : JSON.parse(geojson.to_s)
      coords = extract_exterior_ring(geometry)
      return nil if coords.blank? || coords.size < 4

      ring_area_sq_meters(coords)
    rescue JSON::ParserError, TypeError
      nil
    end

    def self.extract_exterior_ring(geometry)
      return nil if geometry.blank?

      case geometry["type"]
      when "Polygon"
        geometry["coordinates"]&.first
      when "Feature"
        extract_exterior_ring(geometry["geometry"])
      when "FeatureCollection"
        feature = geometry["features"]&.first
        feature ? extract_exterior_ring(feature) : nil
      else
        nil
      end
    end

    # Spherical excess (geodesic) — matches common GIS polygon-on-sphere algorithms.
    def self.ring_area_sq_meters(coords)
      return 0.0 if coords.size < 4

      area = 0.0
      coords.each_cons(2) do |(lon1, lat1), (lon2, lat2)|
        area += to_rad(lon2 - lon1) * (2 + Math.sin(to_rad(lat1)) + Math.sin(to_rad(lat2)))
      end

      (area.abs * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2.0
    end

    def self.to_rad(deg)
      deg.to_f * Math::PI / 180
    end

    private_class_method :to_rad, :ring_area_sq_meters
  end
end
