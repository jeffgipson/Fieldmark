# frozen_string_literal: true

require "test_helper"

class PercentileRankTest < ActiveSupport::TestCase
  test "computes median and percentile rank" do
    values = [90, 100, 110, 120, 130]
    assert_equal 110, PercentileRank.median(values)
    assert_equal 50.0, PercentileRank.call(110, values)
    assert PercentileRank.call(130, values) > 50
  end

  test "distribution stats include quartiles" do
    stats = PercentileRank.distribution_stats([10, 20, 30, 40, 50])
    assert_equal 30, stats[:median]
    assert_equal 5, stats[:count]
    assert stats[:p25] <= stats[:median]
    assert stats[:p75] >= stats[:median]
  end
end
