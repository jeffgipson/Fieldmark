# frozen_string_literal: true

require "test_helper"

class FieldPeerAggregatorTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :benchmark_regions

  test "builds field comparisons when enough peer fields exist" do
    farm = farms(:henderson)
    cohort = PeerCohortSelector.call(farm)
    results = FieldPeerAggregator.call(farm, cohort_farms: cohort)

    assert results.any?
    field_row = results.find { |r| r[:field_id] == fields(:north_80).id }
    assert field_row.present?
    assert field_row[:peer_cohort_size] >= FieldPeerAggregator::MIN_FIELD_COHORT_SIZE
    assert field_row[:categories]["seed"][:peer_median_per_acre].present?
  end

  test "includes fields without cost data as excluded rows" do
    farm = farms(:henderson)
    field = farm.fields.create!(
      name: "West 40",
      acres: 40,
      soil_type: "Silt loam",
      primary_commodity: "corn",
      latitude: 37.31,
      longitude: -89.52
    )

    cohort = PeerCohortSelector.call(farm)
    results = FieldPeerAggregator.call(farm, cohort_farms: cohort)
    excluded = results.find { |r| r[:field_id] == field.id }

    assert excluded.present?
    assert_equal "no_cost_data", excluded[:excluded_reason]
    assert excluded[:categories].empty?
  end
end
