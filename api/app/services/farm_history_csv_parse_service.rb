# frozen_string_literal: true

class FarmHistoryCsvParseService
  MAX_CSV_CHARS = 48_000
  PARSE_PROMPT = <<~PROMPT.squish
    Parse this CSV export from a Midwest corn/soybean farm. Map rows into our schema without asking the farmer to map columns.
    Match field names to the farm's existing fields when possible (fuzzy match on name).
    Categories for costs must be one of: seed, fertilizer, chemicals, labor, custom_hire, other.
    season_year must be a four-digit year. Use null for unknown numbers. Put anything you cannot place in warnings.
  PROMPT

  def self.call(farm, csv_text:)
    new(farm, csv_text:).call
  end

  def initialize(farm, csv_text:)
    @farm = farm
    @csv_text = csv_text.to_s.strip
  end

  def call
    raise ArgumentError, "CSV is empty" if @csv_text.blank?

    truncated = @csv_text.byteslice(0, MAX_CSV_CHARS)
    field_catalog = @farm.fields.order(:name).map { |f| { id: f.id, name: f.name, acres: f.acres, commodity: f.primary_commodity } }

    payload = Ai.json(
      system: AnalystService::SYSTEM_PROMPT,
      keys: %i[summary seasons warnings],
      defaults: { seasons: [], warnings: [] },
      messages: [
        { role: "user", content: farm_context(field_catalog) },
        { role: "user", content: "#{PARSE_PROMPT}\n\nCSV:\n```\n#{truncated}\n```" }
      ],
      max_tokens: 4096
    )

    normalize_payload(payload)
  end

  private

  def farm_context(field_catalog)
    <<~CONTEXT.squish
      Farm: #{@farm.name}, county #{@farm.county}, region #{@farm.region}, commodity #{@farm.primary_commodity}.
      Planning year: #{CurrentSeason.year}. Fields on file: #{field_catalog.to_json}.
      Return seasons as JSON array under key "seasons". Each season object may include:
      season_year (integer), actual_yield (number bu/ac farm-wide if given), actual_price ($/bu),
      actual_total_operating_per_acre ($/ac farm-wide), notes (string),
      field_costs (array of { field_name, category, amount_per_acre }).
    CONTEXT
  end

  def normalize_payload(payload)
    seasons = Array(payload[:seasons] || payload["seasons"]).filter_map do |row|
      normalize_season(row)
    end

    {
      summary: payload[:summary].presence || "Parsed #{seasons.size} season(s) from CSV.",
      seasons: seasons,
      warnings: Array(payload[:warnings] || payload["warnings"]).map(&:to_s).reject(&:blank?)
    }
  end

  def normalize_season(row)
    row = row.with_indifferent_access
    year = row[:season_year].to_i
    return nil if year < 2000

    field_costs = Array(row[:field_costs]).filter_map do |cost_row|
      cost_row = cost_row.with_indifferent_access
      category = normalize_category(cost_row[:category])
      amount = cost_row[:amount_per_acre]
      next if category.blank? || amount.blank?

      {
        field_name: cost_row[:field_name].to_s.strip,
        category: category,
        amount_per_acre: amount.to_f.round(2)
      }
    end

    {
      season_year: year,
      actual_yield: optional_float(row[:actual_yield]),
      actual_price: optional_float(row[:actual_price]),
      actual_total_operating_per_acre: optional_float(row[:actual_total_operating_per_acre]),
      notes: row[:notes].presence,
      field_costs: field_costs
    }
  end

  def normalize_category(value)
    key = value.to_s.downcase.strip.tr(" ", "_")
    key = "custom_hire" if key.in?(%w[custom custom_hire hire])
    key = "chemicals" if key.in?(%w[chemical chem herbicide pesticide])
    key = "fertilizer" if key.in?(%w[fert fertilizer lime])
    InputCost.categories.key?(key) ? key : nil
  end

  def optional_float(value)
    return nil if value.blank?

    value.to_f.round(4)
  end
end
