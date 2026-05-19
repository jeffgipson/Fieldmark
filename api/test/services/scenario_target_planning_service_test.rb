# frozen_string_literal: true

require "test_helper"

class ScenarioTargetPlanningServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios

  setup do
    @farm = farms(:henderson)
    @scenario = scenarios(:base_case)
    @scenario.update!(
      planning_mode: :goal,
      commodity_price: 4.33,
      yield_assumption: 176,
      target_total_margin: 60_000
    )
    @operating = FarmOperatingCosts.weighted_per_acre(@farm)[:total_operating].to_f
  end

  test "returns paths to hit target total margin" do
    plan = ScenarioTargetPlanningService.call(@scenario, operating_cost_per_acre: @operating)

    assert plan[:target_margin_per_acre].positive?
    assert plan[:paths].size >= 2
    price_path = plan[:paths].find { |p| p[:key] == "commodity_price" }
    assert price_path[:required_value].positive?
    assert price_path[:detail].present?
  end

  test "reports gap from current base case" do
    base = {
      margin_per_acre: 100.0,
      total_margin: 12_000.0
    }
    plan = ScenarioTargetPlanningService.call(
      @scenario,
      operating_cost_per_acre: @operating,
      current_base_case: base
    )

    assert plan[:gap_margin_per_acre].present?
  end
end
