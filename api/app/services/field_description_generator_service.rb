# frozen_string_literal: true

class FieldDescriptionGeneratorService
  SYSTEM_PROMPT = <<~PROMPT.squish
    You write short field descriptions for Midwest corn and soybean farmers using
    only the data provided. Use plain, professional language — two to four sentences.
    Mention acreage, crop, soil, and location when known. Do not invent facts,
    recommend vendors, or use marketing hype. Output only the description text.
  PROMPT

  def self.call(field:)
    new(field: field).call
  end

  def initialize(field:)
    @field = field
    @farm = field.farm || Farm.find_by(id: field.farm_id)
    raise ActiveRecord::RecordNotFound, "Farm not found for field" if @farm.nil?
  end

  def call
    Ai.ask(user_prompt, system: SYSTEM_PROMPT, max_tokens: 512).to_s.strip.presence || template_description
  rescue Ai::ConfigurationError, Ai::ApiError => e
    Rails.logger.warn("[FieldDescriptionGeneratorService] AI unavailable (#{e.class}): #{e.message}")
    template_description
  end

  private

  def user_prompt
    <<~PROMPT
      Write a field description from this data:

      #{JSON.generate(context)}
    PROMPT
  end

  def context
    meta = @field.location_meta || {}
    geocode = meta["geocode"] || meta[:geocode] || {}

    {
      field: {
        name: @field.name,
        acres: @field.acres&.to_f,
        soil_type: @field.soil_type,
        primary_commodity: @field.primary_commodity,
        has_boundary: @field.boundary.present?,
        latitude: @field.latitude&.to_f,
        longitude: @field.longitude&.to_f
      },
      farm: {
        name: @farm.name,
        county: @farm.county,
        region: @farm.region,
        total_acres: @farm.total_acres&.to_f
      },
      location: {
        display_name: geocode["display_name"] || geocode[:display_name],
        county: geocode["county"] || geocode[:county],
        state: geocode["state_code"] || geocode[:state_code]
      }.compact,
      input_costs_per_acre: input_cost_summary
    }
  end

  def input_cost_summary
    @field.input_costs
           .where(season_year: CurrentSeason.year)
           .each_with_object({}) do |cost, hash|
      hash[cost.category.to_s] = cost.amount_per_acre&.to_f
    end
  end

  def template_description
    commodity = @field.primary_commodity.to_s.tr("_", " ")
    acres = @field.acres&.to_f
    loc_parts = [geocode_county, @farm.county, "Missouri"].compact.uniq
    loc = loc_parts.join(", ").presence

    sentences = []
    lead = +"#{@field.name} is"
    lead << " a #{format("%.1f", acres)}-acre" if acres&.positive?
    lead << " #{commodity}"
    lead << " field on #{@farm.name}" if @farm.name.present?
    sentences << "#{lead}."

    if @field.soil_type.present?
      sentences << "The ground is #{@field.soil_type.downcase}."
    end

    if loc.present?
      sentences << "It sits in #{loc}."
    elsif @field.boundary.present?
      sentences << "The boundary is mapped on file for this farm."
    end

    costs = input_cost_summary
    if costs.any?
      top = costs.max_by { |_, v| v }
      sentences << "Recorded #{CurrentSeason.year} input costs include about $#{format('%.0f', top[1])}/ac for #{top[0].tr('_', ' ')}."
    end

    sentences.first(4).join(" ")
  end

  def geocode_county
    meta = @field.location_meta || {}
    geocode = meta["geocode"] || meta[:geocode] || {}
    geocode["county"] || geocode[:county]
  end
end
