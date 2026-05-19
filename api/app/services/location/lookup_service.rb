# frozen_string_literal: true

module Location
  class LookupService
    SOIL_BY_REGION = {
      "northern" => "Silt loam",
      "central" => "Silt loam",
      "southwest" => "Clay loam"
    }.freeze

    COMMODITY_BY_REGION = {
      "northern" => "corn",
      "central" => "both",
      "southwest" => "soybean"
    }.freeze

    def self.call(latitude:, longitude:, boundary: nil)
      new(latitude: latitude, longitude: longitude, boundary: boundary).call
    end

    def initialize(latitude:, longitude:, boundary: nil)
      @latitude = latitude
      @longitude = longitude
      @boundary = boundary
    end

    def call
      geocode = ReverseGeocoder.call(latitude: @latitude, longitude: @longitude) || {}
      in_missouri = MissouriRegions.in_missouri?(@latitude, @longitude) ||
                    geocode[:state_code].to_s.upcase == "MO" ||
                    geocode[:state].to_s.include?("Missouri")

      county = geocode[:county]
      region = if in_missouri
                 MissouriRegions.region_for_county(county) ||
                   MissouriRegions.region_for_coordinates(@latitude, @longitude)
               end

      acres = PolygonArea.acres_from_geojson(@boundary) if @boundary.present?
      centroid = centroid_from_boundary || { latitude: @latitude, longitude: @longitude }

      {
        latitude: centroid[:latitude],
        longitude: centroid[:longitude],
        county: county,
        state: geocode[:state],
        state_code: geocode[:state_code],
        region: region,
        acres: acres,
        suggested_soil_type: SOIL_BY_REGION[region] || "Silt loam",
        suggested_primary_commodity: commodity_suggestion(region, in_missouri),
        display_name: geocode[:display_name],
        in_missouri: in_missouri,
        benchmark_region_available: region.present?,
        location_meta: {
          geocoded_at: Time.current.iso8601,
          geocode: geocode,
          inferred_region: region,
          boundary_acres: acres
        }.compact
      }
    end

    private

    def commodity_suggestion(region, in_missouri)
      return "corn" unless in_missouri

      COMMODITY_BY_REGION[region] || "corn"
    end

    def centroid_from_boundary
      return nil if @boundary.blank?

      ring = PolygonArea.extract_exterior_ring(normalized_boundary)
      return nil if ring.blank?

      lngs = ring.map { |c| c[0].to_f }
      lats = ring.map { |c| c[1].to_f }
      {
        longitude: (lngs.sum / lngs.size).round(7),
        latitude: (lats.sum / lats.size).round(7)
      }
    end

    def normalized_boundary
      return @boundary if @boundary.is_a?(Hash)

      JSON.parse(@boundary.to_s)
    rescue JSON::ParserError
      nil
    end
  end
end
