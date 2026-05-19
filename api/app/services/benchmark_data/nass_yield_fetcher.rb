# frozen_string_literal: true

require "net/http"
require "json"

module BenchmarkData
  class NassYieldFetcher
    BASE_URL = "https://quickstats.nass.usda.gov/api/api_GET/"

    def self.call
      new.call
    end

    def call
      api_key = AppConfig.nass_api_key
      if api_key.blank?
        puts "Skipping NASS fetch: NASS_API_KEY not set."
        return
      end

      corn_data = fetch("CORN", api_key)
      soybean_data = fetch("SOYBEANS", api_key)

      output_path = Rails.root.join("db", "seeds", "usda_yield_data.json")
      File.write(output_path, JSON.pretty_generate({ corn: corn_data, soybeans: soybean_data }))
      puts "Wrote USDA NASS yield data to #{output_path}"
    end

    private

    def fetch(commodity, api_key)
      params = {
        key: api_key,
        commodity_desc: commodity,
        statisticcat_desc: "YIELD",
        unit_desc: "BU / ACRE",
        state_name: "MISSOURI",
        year__GE: 2022,
        format: "JSON"
      }
      uri = URI(BASE_URL)
      uri.query = URI.encode_www_form(params)
      response = Net::HTTP.get_response(uri)
      JSON.parse(response.body)["data"]
    end
  end
end
