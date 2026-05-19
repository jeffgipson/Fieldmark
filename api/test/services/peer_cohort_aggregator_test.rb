# frozen_string_literal: true

require "test_helper"

class PeerCohortAggregatorTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :benchmark_regions

  test "returns peer medians and percentiles when cohort is large enough" do
    farm = farms(:henderson)
    cohort = PeerCohortSelector.call(farm)
    result = PeerCohortAggregator.call(farm, cohort_farms: cohort)

    assert result[:available]
    assert result[:size] >= PeerCohortSelector::MIN_COHORT_SIZE
    assert result[:peer_costs_per_acre][:seed].present?
    assert result[:peer_percentiles][:seed].present?
  end
end
