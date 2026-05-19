# frozen_string_literal: true

require "test_helper"

class MarginPeerAggregatorTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  test "aggregates margin distribution from cohort scenarios" do
    farm = farms(:henderson)
    scenario = scenarios(:base_case)
    cohort = PeerCohortSelector.call(farm)
    result = MarginPeerAggregator.call(scenario, cohort_farms: cohort)

    assert result[:available]
    assert result[:cohort_size] >= PeerCohortSelector::MIN_COHORT_SIZE
    assert result[:peer_median_base_margin_per_acre].present?
    assert result[:base_margin_peer_percentile].present?
  end
end
