# frozen_string_literal: true

module PeerComparisonFlags
  module_function

  def flag_for(diff, reference)
    return "at_average" if reference.to_f.zero?

    pct = (diff.to_f / reference.to_f) * 100
    return "below_average" if pct <= -5
    return "at_average" if pct.abs <= 5
    return "above_average" if pct <= 15

    "significantly_above"
  end
end
