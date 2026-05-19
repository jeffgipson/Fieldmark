# frozen_string_literal: true

require "faker"

module SampleData
  # Builds db/seeds/cape_girardeau_sample.json with reproducible Cape Girardeau County test data.
  class CapeGirardeauGenerator
    OUTPUT_PATH = Rails.root.join("db/seeds/cape_girardeau_sample.json")
    CAPE_EMAIL_SUFFIX = "@cape.fieldmark.app"

    # Rough Cape Girardeau County bounds
    LAT_RANGE = (37.06..37.47).freeze
    LNG_RANGE = (-89.71..-89.44).freeze

    SOIL_TYPES = ["Silt loam", "Clay loam", "Alluvial"].freeze
    FARM_COMMODITIES = %w[corn soybean both].freeze
    FIELD_COMMODITIES = %w[corn soybean].freeze

    FIELD_NAME_PREFIXES = %w[North South East West Home River Hill Creek Bottom Tract].freeze

    CORN_COST_BASE = { seed: 100.0, fertilizer: 190.0, chemicals: 108.0 }.freeze
    SOY_COST_BASE = { seed: 75.0, fertilizer: 90.0, chemicals: 70.0 }.freeze

    CORN_SCENARIO = {
      name: "Base Case 2026",
      commodity_price: 4.33,
      yield_assumption: 176,
      downside_commodity_price: 3.8,
      downside_yield: 160
    }.freeze

    SOY_SCENARIO = {
      name: "Base Case 2026",
      commodity_price: 11.2,
      yield_assumption: 52,
      downside_commodity_price: 9.8,
      downside_yield: 46
    }.freeze

    DEMO_FARMER = {
      demo_account: true,
      first_name: "Mike",
      last_name: "Henderson",
      email: "demo@fieldmark.app",
      farm: {
        name: "Henderson Family Farm",
        total_acres: 305,
        county: "Cape Girardeau",
        region: "central",
        primary_commodity: "corn",
        latitude: 37.3059,
        longitude: -89.5181,
        fields: [
          { name: "North 80", acres: 80, soil_type: "Silt loam", primary_commodity: "corn",
            latitude: 37.312, longitude: -89.524, costs: { seed: 105.5, fertilizer: 198, chemicals: 112 } },
          { name: "River bottom 120", acres: 120, soil_type: "Alluvial", primary_commodity: "corn",
            latitude: 37.298, longitude: -89.512, costs: { seed: 99, fertilizer: 205, chemicals: 108 } },
          { name: "Home place 40", acres: 40, soil_type: "Silt loam", primary_commodity: "soybean",
            latitude: 37.304, longitude: -89.521, costs: { seed: 78, fertilizer: 94, chemicals: 72 } },
          { name: "East 65", acres: 65, soil_type: "Clay loam", primary_commodity: "corn",
            latitude: 37.308, longitude: -89.505, costs: { seed: 110, fertilizer: 192, chemicals: 115 } }
        ],
        scenario: CORN_SCENARIO
      }
    }.freeze

    def self.call(count: 100, output_path: OUTPUT_PATH)
      new(count:, output_path:).call
    end

    def initialize(count: 100, output_path: OUTPUT_PATH)
      @count = [count.to_i, 1].max
      @output_path = output_path
      @rng = Random.new(42_026)
    end

    def call
      Faker::Config.random = @rng

      farmers = [deep_stringify(DEMO_FARMER)]
      farmers.concat(build_generated_farmers(@count - 1)) if @count > 1

      payload = {
        description: "Sample farmers in Cape Girardeau County, MO (#{farmers.size} accounts). Password: DEMO_PASSWORD.",
        generated_at: Time.current.iso8601,
        farmer_count: farmers.size,
        farmers: farmers
      }

      File.write(@output_path, JSON.pretty_generate(payload))
      field_count = farmers.sum { |f| f.dig("farm", "fields").size }

      {
        path: @output_path,
        farmers: farmers.size,
        fields: field_count
      }
    end

    private

    def build_generated_farmers(n)
      used_emails = Set.new(["demo@fieldmark.app"])

      Array.new(n) do |index|
        first = Faker::Name.first_name
        last = Faker::Name.last_name
        slug = "#{first}.#{last}".downcase.gsub(/[^a-z0-9.]/, "")
        email = unique_email(slug, index + 1, used_emails)

        farm_commodity = FARM_COMMODITIES[index % FARM_COMMODITIES.size]
        hq_lat, hq_lng = random_point_in_county

        field_count = 2 + (index % 4)
        fields = build_fields(index, hq_lat, hq_lng, field_count)
        total_acres = fields.sum { |f| f["acres"] }

        {
          "first_name" => first,
          "last_name" => last,
          "email" => email,
          "farm" => {
            "name" => "#{last} #{farm_suffix(index)}",
            "total_acres" => total_acres,
            "county" => "Cape Girardeau",
            "region" => "central",
            "primary_commodity" => farm_commodity,
            "latitude" => round_coord(hq_lat),
            "longitude" => round_coord(hq_lng),
            "fields" => fields,
            "scenario" => scenario_for(farm_commodity, index)
          }
        }
      end
    end

    def unique_email(slug, index, used_emails)
      base = "#{slug}#{CAPE_EMAIL_SUFFIX}"
      candidate = used_emails.include?(base) ? "farmer#{index.to_s.rjust(3, '0')}#{CAPE_EMAIL_SUFFIX}" : base
      used_emails << candidate
      candidate
    end

    def farm_suffix(index)
      %w[Farm Farms Place Acres Home Farm LLC].fetch(index % 6)
    end

    def build_fields(index, base_lat, base_lng, count)
      Array.new(count) do |field_index|
        commodity = FIELD_COMMODITIES[(index + field_index) % FIELD_COMMODITIES.size]
        acres = field_acres(index, field_index)
        lat = base_lat + jitter(0.012)
        lng = base_lng + jitter(0.018)

        {
          "name" => field_name(index, field_index, acres),
          "acres" => acres,
          "soil_type" => SOIL_TYPES[(index + field_index) % SOIL_TYPES.size],
          "primary_commodity" => commodity,
          "latitude" => round_coord(lat),
          "longitude" => round_coord(lng),
          "costs" => costs_for(commodity, index, field_index)
        }
      end
    end

    def field_name(index, field_index, acres)
      prefix = FIELD_NAME_PREFIXES[(index + field_index) % FIELD_NAME_PREFIXES.size]
      "#{prefix} #{acres}"
    end

    def field_acres(index, field_index)
      sizes = [32, 40, 45, 55, 60, 65, 72, 80, 88, 95, 100, 110, 120, 140, 160]
      sizes[(index * 3 + field_index) % sizes.size]
    end

    def costs_for(commodity, index, field_index)
      base = commodity == "soybean" ? SOY_COST_BASE : CORN_COST_BASE
      variance = ((index + field_index) % 7) - 3

      base.transform_values do |amount|
        (amount + variance * 1.5).round(1)
      end
    end

    def scenario_for(farm_commodity, index)
      template = farm_commodity == "soybean" ? SOY_SCENARIO : CORN_SCENARIO
      template = CORN_SCENARIO if farm_commodity == "both"

      template.merge(
        commodity_price: (template[:commodity_price] + (index % 5) * 0.02).round(2),
        yield_assumption: template[:yield_assumption] + (index % 4)
      ).stringify_keys
    end

    def random_point_in_county
      [rand_in(LAT_RANGE), rand_in(LNG_RANGE)]
    end

    def rand_in(range)
      range.begin + @rng.rand * (range.end - range.begin)
    end

    def jitter(scale)
      (@rng.rand - 0.5) * scale
    end

    def round_coord(value)
      value.round(6)
    end

    def deep_stringify(obj)
      JSON.parse(obj.to_json)
    end
  end
end
