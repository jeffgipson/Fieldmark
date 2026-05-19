# frozen_string_literal: true

require "net/http"
require "json"

module Location
  class ReverseGeocoder
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
    USER_AGENT = "Fieldmark/1.0 (farm planning; contact@fieldmark.app)"

    class << self
      def call(latitude:, longitude:)
        cache_key = "location:reverse:#{latitude.to_f.round(4)}:#{longitude.to_f.round(4)}"
        Rails.cache.fetch(cache_key, expires_in: 7.days) do
          fetch(latitude, longitude)
        end
      end

      private

      def fetch(latitude, longitude)
        uri = URI(NOMINATIM_URL)
        uri.query = URI.encode_www_form(
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
          zoom: 10
        )

        response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 5, read_timeout: 8) do |http|
          request = Net::HTTP::Get.new(uri)
          request["User-Agent"] = USER_AGENT
          request["Accept"] = "application/json"
          http.request(request)
        end

        return nil unless response.is_a?(Net::HTTPSuccess)

        parse_response(JSON.parse(response.body))
      rescue JSON::ParserError, Net::OpenTimeout, Net::ReadTimeout, SocketError => e
        Rails.logger.warn("[Location::ReverseGeocoder] #{e.class}: #{e.message}")
        nil
      end

      def parse_response(body)
        address = body["address"] || {}
        county = address["county"] || address["city"] || address["town"] || address["village"]
        state = address["state"] || address["state_code"]

        {
          display_name: body["display_name"],
          county: county&.sub(/\s+County\z/i, ""),
          state: state,
          state_code: address["state_code"] || infer_state_code(state),
          postal_code: address["postcode"],
          place_id: body["place_id"],
          osm_type: body["osm_type"],
          osm_id: body["osm_id"],
          raw_address: address
        }.compact
      end

      def infer_state_code(state)
        return state if state.to_s.length == 2

        { "Missouri" => "MO" }[state]
      end
    end
  end
end
