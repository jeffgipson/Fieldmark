# frozen_string_literal: true

class YieldContextService
  DATA_PATH = Rails.root.join("db/seeds/usda_yield_data.json")
  SOURCE = "USDA NASS Quick Stats"
  SOURCE_URL = "https://quickstats.nass.usda.gov/"

  def self.call(farm)
    new(farm).call
  end

  def initialize(farm)
    @farm = farm
    @commodity = farm.primary_commodity
  end

  def call
    records = yield_records
    return unavailable_payload if records.empty?

    values = records.map { |r| extract_yield(r) }.compact.sort
    return unavailable_payload if values.empty?

    p10_index = [(values.size * 0.1).floor, 0].max
    p10 = values[p10_index]

    {
      available: true,
      commodity: @commodity,
      state: "Missouri",
      source: SOURCE,
      source_url: SOURCE_URL,
      years: records.map { |r| year_label(r) }.compact,
      average_yield: (values.sum / values.size).round(1),
      min_yield: values.min.round(1),
      max_yield: values.max.round(1),
      p10_yield: p10.round(1),
      suggested_downside_yield: p10.round(1),
      note: "Historical Missouri yields from USDA NASS — use as a reference when setting your downside yield, not a forecast."
    }
  end

  private

  def unavailable_payload
    {
      available: false,
      commodity: @commodity,
      note: "USDA NASS yield history is not loaded for this commodity."
    }
  end

  def yield_records
    return [] unless File.exist?(DATA_PATH)

    data = JSON.parse(File.read(DATA_PATH))
    commodity_name = @commodity.to_s
    key = commodity_name.include?("soy") ? "soybeans" : "corn"
    Array(data[key])
  rescue JSON::ParserError, Errno::ENOENT
    []
  end

  def extract_yield(record)
    value = record["Value"] || record["value"] || record["yield"]
    return nil if value.blank?

    value.to_s.gsub(/[^\d.]/, "").to_f
  end

  def year_label(record)
    record["Year"] || record["year"]
  end
end
