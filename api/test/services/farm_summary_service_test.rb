# frozen_string_literal: true

require "test_helper"

class FarmSummaryServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios

  test "returns mapped acres and field breakdown" do
    farm = farms(:henderson)
    summary = FarmSummaryService.call(farm)

    assert summary[:mapped_acres].positive?
    assert summary[:fields].any?
    assert summary[:fields].first[:operating_cost_per_acre].positive?
  end

  test "flags acre mismatch when profile and mapped acres differ" do
    farm = farms(:henderson)
    farm.update!(total_acres: 9_999)
    summary = FarmSummaryService.call(farm)

    assert_equal false, summary[:acres_reconciled]
    assert_not_equal 0, summary[:acres_delta]
  end

  test "includes scenario snapshot when scenario has results" do
    farm = farms(:henderson)
    scenario = scenarios(:base_case)
    scenario.update!(results: { "base_case" => { "total_margin" => 10_000 } })

    summary = FarmSummaryService.call(farm, scenario: scenario)

    assert_equal scenario.id, summary[:scenario_snapshot][:scenario_id]
    assert_equal 10_000, summary[:scenario_snapshot][:base_case]["total_margin"]
  end
end