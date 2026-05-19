# frozen_string_literal: true

require "test_helper"

class FieldOperatingCostsTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs

  test "per_acre sums operating categories" do
    field = fields(:north_80)
    field.input_costs.where(season_year: CurrentSeason.year).delete_all
    field.input_costs.create!(season_year: CurrentSeason.year, category: :seed, amount_per_acre: 100)
    field.input_costs.create!(season_year: CurrentSeason.year, category: :fertilizer, amount_per_acre: 50)
    field.input_costs.create!(season_year: CurrentSeason.year, category: :custom_hire, amount_per_acre: 25)

    costs = FieldOperatingCosts.per_acre(field)

    assert_equal 150.0, costs[:total_operating]
    assert_equal 25.0, costs[:custom_hire]
  end
end
