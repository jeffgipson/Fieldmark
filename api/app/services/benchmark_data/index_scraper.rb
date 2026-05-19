# frozen_string_literal: true

require "net/http"

module BenchmarkData
  class IndexScraper
    URL = "https://extension.missouri.edu/programs/agricultural-business-and-policy-extension/missouri-crop-and-livestock-enterprise-budgets"

    def self.call
      new.call
    end

    def call
      uri = URI(URL)
      html = Net::HTTP.get(uri)
      doc = Nokogiri::HTML(html)
      doc.css("a[href*='/g0']").map do |link|
        {
          pub_id: link["href"].split("/").last,
          title: link.text.strip,
          commodity: guess_commodity(link.text),
          irrigation: guess_irrigation(link.text),
          url: uri.merge(link["href"]).to_s
        }
      end
    end

    private

    def guess_commodity(text)
      text.downcase.include?("soybean") ? "soybean" : "corn"
    end

    def guess_irrigation(text)
      text.downcase.include?("irrigated") ? "irrigated" : "dryland"
    end
  end
end
