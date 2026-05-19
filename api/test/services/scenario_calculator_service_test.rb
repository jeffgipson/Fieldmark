# frozen_string_literal: true

require "test_helper"

class ScenarioCalculatorServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  test "includes by_field breakdown and outliers" do
    scenario = scenarios(:base_case)
    results = ScenarioCalculatorService.call(scenario)

    assert results[:by_field].is_a?(Array)
    assert results[:by_field].size >= 1
    assert results[:field_outliers][:lowest_base_margin_field_id].present?
    assert results[:field_outliers][:highest_base_margin_field_id].present?
    row = results[:by_field].first
    assert row[:base_case][:margin_per_acre].present?
    assert row.key?(:share_of_farm_base_margin)
  end

  test "includes target_plan when goal and target are set" do
    scenario = scenarios(:base_case)
    scenario.update!(
      planning_mode: :goal,
      commodity_price: 4.33,
      yield_assumption: 176,
      target_total_margin: 50_000
    )
    results = ScenarioCalculatorService.call(scenario)

    assert results[:target_plan].present?
    assert results[:target_plan][:paths].present?
    assert results[:forecast].present?
  end
end
