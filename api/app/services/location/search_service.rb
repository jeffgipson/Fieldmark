# frozen_string_literal: true

require "net/http"
require "json"

module Location
  class SearchService
    SEARCH_URL = "https://nominatim.openstreetmap.org/search"
    USER_AGENT = ReverseGeocoder::USER_AGENT
    # Soft bias for Missouri farm searches (left, top, right, bottom).
    MISSOURI_VIEWBOX = "-95.77,40.61,-89.09,35.99"

    TRIAL_AREA_PATTERN = /
      \b(texas|tx)\b |
      \bdallas\b |
      \b(houston|austin|fort\s+worth|san\s+antonio)\b |
      \b(indiana|in)\b |
      \bmarion\s+(county\s+)?in\b |
      \bindianapolis\b
    /ix

    MISSOURI_PATTERN = /\b(missouri|mo)\b/i

    def self.call(query:, limit: 5)
      return [] if query.to_s.strip.length < 3

      cache_key = "location:search:v2:#{query.to_s.strip.downcase}:#{limit}"
      Rails.cache.fetch(cache_key, expires_in: 1.day) do
        fetch(query, limit)
      end
    end

    def self.nominatim_query(query)
      stripped = query.to_s.strip
      return stripped if stripped.blank?

      if trial_area_search?(stripped) || MISSOURI_PATTERN.match?(stripped)
        with_usa_suffix(stripped)
      else
        with_usa_suffix("#{stripped}, Missouri")
      end
    end

    def self.trial_area_search?(query)
      return true if query.match?(TRIAL_AREA_PATTERN)

      # "Dallas" without MO context — Regrid trial area (TX), not Dallas County MO.
      query.match?(/\bdallas\b/i) && !query.match?(MISSOURI_PATTERN)
    end

    def self.with_usa_suffix(query)
      return query if query.match?(/\b(usa|united states)\b/i)

      "#{query}, USA"
    end

    def self.fetch(query, limit)
      uri = URI(SEARCH_URL)
      params = {
        q: nominatim_query(query),
        format: "json",
        addressdetails: 1,
        limit: limit,
        countrycodes: "us"
      }
      params[:viewbox] = MISSOURI_VIEWBOX unless trial_area_search?(query.to_s)

      uri.query = URI.encode_www_form(params)

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 5, read_timeout: 8) do |http|
        request = Net::HTTP::Get.new(uri)
        request["User-Agent"] = USER_AGENT
        http.request(request)
      end

      return [] unless response.is_a?(Net::HTTPSuccess)

      JSON.parse(response.body).map do |hit|
        {
          display_name: hit["display_name"],
          latitude: hit["lat"].to_f,
          longitude: hit["lon"].to_f,
          place_id: hit["place_id"]
        }
      end
    rescue JSON::ParserError, Net::OpenTimeout, Net::ReadTimeout, SocketError => e
      Rails.logger.warn("[Location::SearchService] #{e.class}: #{e.message}")
      []
    end
  end
end
