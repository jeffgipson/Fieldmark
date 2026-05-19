# frozen_string_literal: true

class PercentileRank
  def self.call(value, values)
    return nil if values.blank?

    nums = values.map(&:to_f)
    below = nums.count { |v| v < value.to_f }
    equal = nums.count { |v| v == value.to_f }
    ((below + 0.5 * equal) / nums.size.to_f * 100).round(2)
  end

  def self.median(values)
    return nil if values.blank?

    sorted = values.map(&:to_f).sort
    mid = sorted.size / 2
    return sorted[mid] if sorted.size.odd?

    ((sorted[mid - 1] + sorted[mid]) / 2.0).round(2)
  end

  def self.mean(values)
    return nil if values.blank?

    (values.map(&:to_f).sum / values.size.to_f).round(2)
  end

  def self.percentile_value(values, percentile)
    return nil if values.blank?

    sorted = values.map(&:to_f).sort
    rank = (percentile.to_f / 100.0) * (sorted.size - 1)
    lower = sorted[rank.floor]
    upper = sorted[rank.ceil]
    (lower + (upper - lower) * (rank - rank.floor)).round(2)
  end

  def self.distribution_stats(values)
    return nil if values.blank?

    {
      median: median(values),
      p25: percentile_value(values, 25),
      p75: percentile_value(values, 75),
      mean: mean(values),
      count: values.size
    }
  end
end
