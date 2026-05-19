# frozen_string_literal: true

class ScenarioCalculatorService
  def self.call(scenario, apply_macro: false)
    new(scenario, apply_macro:).call
  end

  def initialize(scenario, apply_macro: false)
    @scenario = scenario
    @farm = scenario.farm
    @apply_macro = apply_macro
  end

  def call
    weighted = weighted_costs
    base_operating = FarmOperatingCosts.weighted_per_acre(@farm)[:total_operating].to_f
    macro_payload = macro_adjustments_if_applied(base_operating)
    operating_for_farm = macro_payload&.dig(:adjusted_operating_cost_per_acre) || base_operating

    by_field = build_by_field
    field_outliers = build_field_outliers(by_field)
    forecast = ForecastProjectionService.call(@scenario)
    base_case = margin_case(
      price: @scenario.commodity_price,
      yield_per_acre: @scenario.yield_assumption,
      operating_cost_per_acre: operating_for_farm
    )
    target_plan = build_target_plan(operating_for_farm, base_case)

    {
      season_year: CurrentSeason.year,
      weighted_costs_per_acre: weighted,
      base_case: base_case,
      target_plan: target_plan,
      downside_case: margin_case(
        price: @scenario.downside_commodity_price,
        yield_per_acre: @scenario.downside_yield,
        operating_cost_per_acre: operating_for_farm
      ),
      by_field: by_field,
      field_outliers: field_outliers,
      macro_adjustments: macro_payload,
      forecast: forecast,
      sensitivity: ScenarioSensitivityService.call(@scenario, operating_cost_override: operating_for_farm),
      calculated_at: Time.current.iso8601
    }
  end

  private

  def weighted_costs
    totals = Hash.new(0.0)
    total_acres = @farm.fields.sum(:acres).to_f
    return totals if total_acres.zero?

    @farm.fields.includes(:input_costs).find_each do |field|
      weight = field.acres.to_f / total_acres
      field.input_costs.where(season_year: CurrentSeason.year).find_each do |cost|
        totals[cost.category] += cost.amount_per_acre.to_f * weight
      end
    end

    totals.transform_values { |value| value.round(2) }
  end

  def macro_adjustments_if_applied(base_operating)
    return nil unless @apply_macro

    impact = MacroImpactService.call(@farm)
    bump = impact[:total_suggested_bump_per_acre].to_f
    adjusted = (base_operating + bump).round(2)

    impact.merge(
      applied: true,
      base_operating_cost_per_acre: base_operating.round(2),
      adjusted_operating_cost_per_acre: adjusted
    )
  end

  def build_by_field
    total_acres = @farm.fields.sum(:acres).to_f
    return [] if total_acres.zero?

    rows = @farm.fields.includes(:input_costs).order(:name).map do |field|
      operating = FieldOperatingCosts.per_acre(field)[:total_operating]
      acres = field.acres.to_f
      base = field_margin_case(
        price: @scenario.commodity_price,
        yield_per_acre: @scenario.yield_assumption,
        operating_cost_per_acre: operating,
        acres: acres
      )
      downside = field_margin_case(
        price: @scenario.downside_commodity_price,
        yield_per_acre: @scenario.downside_yield,
        operating_cost_per_acre: operating,
        acres: acres
      )

      {
        field_id: field.id,
        field_name: field.name,
        acres: acres.round(2),
        primary_commodity: field.primary_commodity,
        operating_cost_per_acre: operating,
        base_case: base,
        downside_case: downside
      }
    end

    total_base_margin = rows.sum { |row| row[:base_case]&.dig(:total_margin).to_f }
    rows.map do |row|
      field_total = row[:base_case]&.dig(:total_margin).to_f
      share = total_base_margin.zero? ? 0.0 : (field_total / total_base_margin * 100)
      row.merge(share_of_farm_base_margin: share.round(1))
    end
  end

  def build_field_outliers(by_field)
    with_base = by_field.select { |row| row[:base_case].present? }
    return {} if with_base.empty?

    lowest = with_base.min_by { |row| row[:base_case][:margin_per_acre].to_f }
    highest = with_base.max_by { |row| row[:base_case][:margin_per_acre].to_f }

    {
      lowest_base_margin_field_id: lowest[:field_id],
      highest_base_margin_field_id: highest[:field_id],
      base_margin_spread_per_acre: (
        highest[:base_case][:margin_per_acre].to_f - lowest[:base_case][:margin_per_acre].to_f
      ).round(2)
    }
  end

  def margin_case(price:, yield_per_acre:, operating_cost_per_acre:)
    return nil if price.blank? || yield_per_acre.blank?

    total_acres = @farm.fields.sum(:acres).to_f
    revenue_per_acre = price.to_f * yield_per_acre.to_f
    margin_per_acre = revenue_per_acre - operating_cost_per_acre

    {
      revenue_per_acre: revenue_per_acre.round(2),
      operating_cost_per_acre: operating_cost_per_acre.round(2),
      margin_per_acre: margin_per_acre.round(2),
      total_margin: (margin_per_acre * total_acres).round(2),
      total_acres: total_acres.round(2)
    }
  end

  def build_target_plan(operating_for_farm, base_case)
    return nil unless @scenario.goal? || @scenario.target_total_margin.present? || @scenario.target_margin_per_acre.present?

    ScenarioTargetPlanningService.call(
      @scenario,
      operating_cost_per_acre: operating_for_farm,
      current_base_case: base_case
    )
  end

  def field_margin_case(price:, yield_per_acre:, operating_cost_per_acre:, acres:)
    return nil if price.blank? || yield_per_acre.blank?

    revenue_per_acre = price.to_f * yield_per_acre.to_f
    margin_per_acre = revenue_per_acre - operating_cost_per_acre

    {
      revenue_per_acre: revenue_per_acre.round(2),
      margin_per_acre: margin_per_acre.round(2),
      total_margin: (margin_per_acre * acres).round(2)
    }
  end
end
