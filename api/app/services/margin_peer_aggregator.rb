# frozen_string_literal: true

class MarginPeerAggregator
  def self.call(scenario, cohort_farms:)
    new(scenario, cohort_farms:).call
  end

  def initialize(scenario, cohort_farms:)
    @scenario = scenario
    @cohort_farms = cohort_farms
  end

  def call
    base_margins = []
    downside_margins = []

    @cohort_farms.each do |farm|
      margin_scenario = representative_scenario(farm)
      next unless margin_scenario

      base = margin_scenario.results&.dig("base_case", "margin_per_acre")
      downside = margin_scenario.results&.dig("downside_case", "margin_per_acre")
      base_margins << base.to_f if base.present?
      downside_margins << downside.to_f if downside.present?
    end

    available = base_margins.size >= PeerCohortSelector::MIN_COHORT_SIZE
    user_base = @scenario.results&.dig("base_case", "margin_per_acre")
    user_downside = @scenario.results&.dig("downside_case", "margin_per_acre")

    return unavailable_payload unless available

    base_stats = PercentileRank.distribution_stats(base_margins)
    downside_stats = downside_margins.any? ? PercentileRank.distribution_stats(downside_margins) : nil

    {
      available: true,
      cohort_size: base_margins.size,
      user_base_margin_per_acre: user_base&.to_f,
      peer_median_base_margin_per_acre: base_stats[:median],
      peer_p25_base_margin_per_acre: base_stats[:p25],
      peer_p75_base_margin_per_acre: base_stats[:p75],
      base_margin_peer_percentile: user_base.present? ? PercentileRank.call(user_base, base_margins) : nil,
      user_downside_margin_per_acre: user_downside&.to_f,
      peer_median_downside_margin_per_acre: downside_stats&.dig(:median),
      peer_p25_downside_margin_per_acre: downside_stats&.dig(:p25),
      peer_p75_downside_margin_per_acre: downside_stats&.dig(:p75),
      downside_margin_peer_percentile: user_downside.present? && downside_margins.any? ?
        PercentileRank.call(user_downside, downside_margins) : nil
    }
  end

  private

  def representative_scenario(farm)
    farm.scenarios.find { |s| s.name.match?(/base case/i) } || farm.scenarios.first
  end

  def unavailable_payload
    {
      available: false,
      cohort_size: 0
    }
  end
end
