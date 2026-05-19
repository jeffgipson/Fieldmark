# frozen_string_literal: true

require "test_helper"

class ForecastProjectionServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  test "returns three-year margin bands" do
    scenario = scenarios(:base_case)
    result = ForecastProjectionService.call(scenario)

    assert_equal CurrentSeason.year, result[:base_year]
    assert_equal 3, result[:years].size
    row = result[:years].first
    assert row[:margins][:base][:margin_per_acre].present?
    assert row[:margins][:p25].present?
    assert row[:margins][:p75].present?
    assert row[:downside].present?
  end

  test "includes feedback when prior snapshot exists" do
    scenario = scenarios(:base_case)
    farm = scenario.farm
    farm.farm_season_snapshots.create!(
      season_year: CurrentSeason.year - 1,
      actual_total_operating_per_acre: 500,
      source: :farmer_entered
    )

    result = ForecastProjectionService.call(scenario)
    assert result[:feedback].any? { |f| f.include?("closed at") }
  end
end
