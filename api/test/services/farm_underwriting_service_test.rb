# frozen_string_literal: true

require "test_helper"

class FarmUnderwritingServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios

  setup do
    MacroDriversSeed.call
    @farm = farms(:henderson)
    @scenario = scenarios(:base_case)
    @scenario.update!(
      results: {
        "base_case" => {
          "margin_per_acre" => 200.0,
          "total_margin" => 24_000.0,
          "operating_cost_per_acre" => 400.0,
          "revenue_per_acre" => 600.0,
          "total_acres" => 120.0
        },
        "downside_case" => {
          "margin_per_acre" => 80.0,
          "total_margin" => 9_600.0,
          "operating_cost_per_acre" => 400.0,
          "revenue_per_acre" => 480.0,
          "total_acres" => 120.0
        },
        "field_outliers" => { "base_margin_spread_per_acre" => 30.0 },
        "sensitivity" => {
          "summary" => {
            "worst_margin_per_acre" => 50.0,
            "breakeven_price_at_base_yield" => 3.85
          }
        }
      }
    )
  end

  test "returns pillars and rating when scenario is calculated" do
    result = FarmUnderwritingService.call(@farm, scenario: @scenario)

    assert_includes FarmUnderwritingService::RATINGS, result[:rating]
    assert result[:pillars].size == 5
    assert result[:pillars].all? { |p| p[:factors].present? }
    assert result[:summary].present?
    assert result[:disclaimer].include?("loan approval")
  end

  test "insufficient_data without input costs" do
    @farm.fields.find_each { |f| f.input_costs.destroy_all }
    result = FarmUnderwritingService.call(@farm, scenario: @scenario)

    assert_equal "insufficient_data", result[:rating]
  end
end
