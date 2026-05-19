# frozen_string_literal: true

module Location
  class MissouriRegions
    CONFIG_PATH = Rails.root.join("config/missouri_county_regions.yml").freeze

    class << self
      def region_for_county(county_name)
        return nil if county_name.blank?

        normalized = normalize_county(county_name).downcase
        mapping.each do |region, counties|
          return region.to_s if counties.map(&:downcase).include?(normalized)
        end
        "central"
      end

      def region_for_coordinates(latitude, longitude)
        return nil unless in_missouri?(latitude, longitude)

        lat = latitude.to_f
        lng = longitude.to_f
        return "southwest" if lng < -93.2 && lat < 38.2
        return "northern" if lat >= 39.6

        "central"
      end

      def in_missouri?(latitude, longitude)
        lat = latitude.to_f
        lng = longitude.to_f
        lat.between?(35.9, 40.7) && lng.between?(-95.8, -89.0)
      end

      private

      def mapping
        @mapping ||= YAML.load_file(CONFIG_PATH).transform_values do |counties|
          counties.map { |name| normalize_county(name) }
        end
      end

      def normalize_county(name)
        name.to_s
            .sub(/\s+County\z/i, "")
            .sub(/\s+City\z/i, "")
            .strip
            .downcase
            .gsub(/\s+/, " ")
            .split.map(&:capitalize).join(" ")
      end
    end
  end
end
