# frozen_string_literal: true

require "test_helper"

class ScenarioSensitivityServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  setup do
    @scenario = scenarios(:base_case)
  end

  test "returns grid and summary when scenario has assumptions" do
    @scenario.update!(
      commodity_price: 4.33,
      yield_assumption: 176,
      downside_commodity_price: 3.80,
      downside_yield: 160
    )

    result = ScenarioSensitivityService.call(@scenario)

    assert_equal 5, result[:price_labels].size
    assert_equal 5, result[:yield_labels].size
    assert_equal 5, result[:grid].size
    assert result[:summary][:breakeven_price_at_base_yield].positive?
    assert result[:summary][:worst_margin_per_acre] <= result[:summary][:base_margin_per_acre]
  end
end
