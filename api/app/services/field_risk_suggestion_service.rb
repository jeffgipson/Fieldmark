# frozen_string_literal: true

class FieldRiskSuggestionService
  FLOOD_YIELD_FACTOR = 0.90
  POOR_DRAINAGE_FACTOR = 0.95
  BOTTOMLAND_FACTOR = 0.92

  def self.call(field, scenario: nil)
    new(field, scenario:).call
  end

  def initialize(field, scenario:)
    @field = field
    @scenario = scenario
    @profile = field.field_risk_profile
  end

  def call
    return {} unless @profile
    return {} unless @scenario&.downside_yield.present?

    factor = combined_factor
    return {} if factor >= 1.0

    base_yield = @scenario.downside_yield.to_f
    suggested = (base_yield * factor).round(1)

    {
      suggested_downside_yield: suggested,
      adjustment_factor: factor.round(3),
      farm_downside_yield: base_yield,
      rationale: build_rationale(factor),
      disclaimer: "Suggestion only — does not change your scenario until you apply it."
    }
  end

  private

  def combined_factor
    factor = 1.0
    floods = @profile.flood_events_last_5_years
    factor *= FLOOD_YIELD_FACTOR if floods.present? && floods >= 3
    factor *= POOR_DRAINAGE_FACTOR if @profile.poor?
    factor *= BOTTOMLAND_FACTOR if @profile.bottomland?
    factor
  end

  def build_rationale(factor)
    parts = []
    floods = @profile.flood_events_last_5_years
    parts << "#{floods} flood events in the last 5 years" if floods.present? && floods >= 3
    parts << "poor drainage" if @profile.poor?
    parts << "bottomland" if @profile.bottomland?
    return "No yield adjustment suggested." if parts.empty?

    "Based on #{parts.to_sentence}, consider testing downside yield at #{(factor * 100).round(0)}% of your farm downside assumption."
  end
end
