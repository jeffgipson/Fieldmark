# frozen_string_literal: true

class FarmSummaryService
  def self.call(farm, scenario: nil)
    new(farm, scenario:).call
  end

  def initialize(farm, scenario:)
    @farm = farm
    @scenario = scenario
    @season_year = CurrentSeason.year
  end

  def call
    mapped_acres = @farm.fields.sum(:acres).to_f
    profile_acres = @farm.total_acres.to_f
    acres_delta = (mapped_acres - profile_acres).round(2)
    operating_costs = FarmOperatingCosts.weighted_per_acre(@farm, season_year: @season_year)

    {
      season_year: @season_year,
      mapped_acres: mapped_acres.round(2),
      profile_acres: profile_acres.round(2),
      acres_reconciled: acres_reconciled?(mapped_acres, profile_acres),
      acres_delta: acres_delta,
      operating_costs: operating_costs,
      total_operating_dollars: (operating_costs[:total_operating] * mapped_acres).round(2),
      fields: fields_payload,
      scenario_snapshot: scenario_snapshot_payload,
      peer_headline: peer_headline,
      regional_risk: RegionalRiskContextService.call(@farm),
      macro_impact: MacroImpactService.call(@farm, season_year: @season_year)
    }
  end

  private

  def acres_reconciled?(mapped, profile)
    return true if profile.zero?

    (mapped - profile).abs < 0.01
  end

  def fields_payload
    @farm.fields.includes(:input_costs, :field_risk_profile).order(:name).map do |field|
      costs = FieldOperatingCosts.per_acre(field, season_year: @season_year)
      acres = field.acres.to_f
      row = {
        field_id: field.id,
        name: field.name,
        acres: acres.round(2),
        primary_commodity: field.primary_commodity,
        operating_cost_per_acre: costs[:total_operating],
        total_operating_dollars: (costs[:total_operating] * acres).round(2),
        cost_categories: costs.except(:total_operating)
      }

      if field.field_risk_profile
        row[:risk_profile] = field.field_risk_profile.as_json(only: %i[
          flood_events_last_5_years drainage bottomland risk_notes
        ])
        row[:risk_suggestion] = FieldRiskSuggestionService.call(field, scenario: @scenario)
      end

      by_field_row = scenario_by_field_row(field.id)
      row[:margin] = by_field_row if by_field_row

      row
    end
  end

  def scenario_by_field_row(field_id)
    return nil unless @scenario&.results.is_a?(Hash)

    by_field = @scenario.results["by_field"] || @scenario.results[:by_field]
    return nil unless by_field.is_a?(Array)

    row = by_field.find { |r| r["field_id"] == field_id || r[:field_id] == field_id }
    return nil unless row

    {
      base_margin_per_acre: row.dig("base_case", "margin_per_acre") || row.dig(:base_case, :margin_per_acre),
      downside_margin_per_acre: row.dig("downside_case", "margin_per_acre") || row.dig(:downside_case, :margin_per_acre),
      share_of_farm_base_margin: row["share_of_farm_base_margin"] || row[:share_of_farm_base_margin]
    }
  end

  def scenario_snapshot_payload
    return nil unless @scenario&.results.is_a?(Hash)

    results = @scenario.results.with_indifferent_access
    return nil if results[:base_case].blank?

    {
      scenario_id: @scenario.id,
      scenario_name: @scenario.name,
      base_case: results[:base_case],
      downside_case: results[:downside_case],
      by_field: results[:by_field],
      field_outliers: results[:field_outliers]
    }
  end

  def peer_headline
    summary = @scenario&.peer_comparison&.summary
    return nil unless summary.is_a?(Hash)

    categories = summary["categories"] || summary[:categories]
    return nil unless categories.is_a?(Hash)

    flagged = categories.filter_map do |key, row|
      next unless row.is_a?(Hash)

      flag = row["flag_vs_benchmark"] || row[:flag_vs_benchmark]
      next unless flag.present? && flag != "on_par"

      name = key.to_s.tr("_", " ")
      diff = row["difference_vs_benchmark_per_acre"] || row[:difference_vs_benchmark_per_acre]
      "#{name} #{format_diff(diff)} vs benchmark"
    end

    flagged.first
  end

  def format_diff(diff)
    value = diff.to_f
    return "even" if value.abs < 0.01

    value.positive? ? "$#{value.round(2)}/ac above" : "$#{value.abs.round(2)}/ac below"
  end
end
