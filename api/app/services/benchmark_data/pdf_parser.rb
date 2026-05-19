# frozen_string_literal: true

require "open-uri"

module BenchmarkData
  class PdfParser
    # Maps messy PDF labels to clean JSON keys
    LABEL_MAP = {
      "seed" => :seed,
      "fertilizer" => :fertilizer,
      "crop protection chemicals" => :chemicals,
      "labor" => :labor,
      "custom hire" => :custom_hire,
      "drying" => :drying,
      "supplies, storage, marketing" => :supplies_storage_marketing,
      "consulting & insurance" => :consulting_insurance,
      "machinery fuel" => :machinery_fuel,
      "machinery repairs" => :machinery_repairs,
      "management" => :management,
      "operating interest" => :operating_interest,
      "total operating costs" => :total_operating,
      "farm overhead" => :farm_overhead,
      "machinery ownership" => :machinery_ownership,
      "real estate" => :real_estate,
      "total ownership costs" => :total_ownership,
      "total costs" => :total_costs,
      "your projected returns above total costs" => :income_over_total,
      "your projected returns to land and management" => :return_to_land_and_management,
    }.freeze

    def self.call(url)
      new(url).call
    end

    def initialize(url)
      @url = url
    end

    def call
      reader = PDF::Reader.new(URI.open(@url))
      text = reader.pages.map(&:text).join("\n")
      parse(text)
    end

    private

    def parse(text)
      costs = {}
      text.each_line do |line|
        normalized = line.strip.downcase.gsub(/\s+/, " ")
        LABEL_MAP.each do |label, key|
          if normalized.start_with?(label)
            costs[key] = normalized.split.last.tr("$,", "").to_f
            break
          end
        end
      end
      { "costs_per_acre" => costs }
    end
  end
end
