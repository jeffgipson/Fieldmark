# frozen_string_literal: true

require "test_helper"

class FarmHistoryCsvApplyServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios

  setup do
    @farm = farms(:henderson)
    @field = fields(:north_80)
  end

  test "applies season snapshots and field costs from parsed payload" do
    parsed = {
      summary: "2 seasons",
      warnings: [],
      seasons: [
        {
          season_year: 2024,
          actual_yield: 165.0,
          actual_price: 4.05,
          actual_total_operating_per_acre: 410.0,
          notes: "Closed books",
          field_costs: [
            { field_name: "North 80", category: "seed", amount_per_acre: 98.0 },
            { field_name: "North 80", category: "fertilizer", amount_per_acre: 185.0 }
          ]
        }
      ]
    }

    result = FarmHistoryCsvApplyService.call(@farm, parsed: parsed)

    assert_equal 1, result[:seasons_applied]
    assert result[:costs_applied] >= 2
    snapshot = @farm.farm_season_snapshots.find_by(season_year: 2024)
    assert_equal 165.0, snapshot.actual_yield.to_f
    assert snapshot.import?

    cost = @field.input_costs.find_by(season_year: 2024, category: :seed)
    assert_equal 98.0, cost.amount_per_acre.to_f
  end
end
