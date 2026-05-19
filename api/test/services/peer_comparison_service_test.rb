# frozen_string_literal: true

require "test_helper"

class PeerComparisonServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  test "builds full summary with benchmark and peer data" do
    scenario = scenarios(:base_case)
    comparison = PeerComparisonService.call(scenario)
    summary = comparison.summary

    assert summary["cohort"]["available"]
    assert summary["peer_costs_per_acre"].present?
    assert summary["categories"]["seed"]["peer_median_per_acre"].present?
    assert summary["categories"]["seed"]["flag_vs_benchmark"].present?
    assert summary["field_comparisons"].any?
    assert summary["margin_comparison"]["available"]
    assert comparison.seed_percentile.present?
  end
end
