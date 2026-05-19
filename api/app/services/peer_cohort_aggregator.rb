# frozen_string_literal: true

class PeerCohortAggregator
  CATEGORY_KEYS = %i[seed fertilizer chemicals labor total_operating].freeze

  def self.call(farm, cohort_farms:, season_year: CurrentSeason.year)
    new(farm, cohort_farms:, season_year:).call
  end

  def initialize(farm, cohort_farms:, season_year:)
    @farm = farm
    @cohort_farms = cohort_farms
    @season_year = season_year
  end

  def call
    user_costs = normalize_costs(FarmOperatingCosts.weighted_per_acre(@farm, season_year: @season_year))
    cohort_costs = @cohort_farms.map { |f| normalize_costs(FarmOperatingCosts.weighted_per_acre(f, season_year: @season_year)) }
    available = cohort_costs.size >= PeerCohortSelector::MIN_COHORT_SIZE

    peer_medians = {}
    peer_stats = {}
    peer_percentiles = {}

    if available
      CATEGORY_KEYS.each do |key|
        values = cohort_costs.map { |costs| costs[key] }
        peer_stats[key] = PercentileRank.distribution_stats(values)
        peer_medians[key] = peer_stats[key][:median]
        peer_percentiles[key] = PercentileRank.call(user_costs[key], values)
      end
    end

    {
      available: available,
      size: cohort_costs.size,
      region: @farm.region,
      commodity: PeerCohortSelector.cohort_commodity_for(@farm),
      season_year: @season_year,
      source: "fieldmark_peers",
      user_costs_per_acre: user_costs,
      peer_costs_per_acre: peer_medians.transform_keys { |k| k == :total_operating ? :total : k },
      peer_stats: peer_stats.transform_keys { |k| k == :total_operating ? :total : k },
      peer_percentiles: peer_percentiles.transform_keys { |k| k == :total_operating ? :total : k }
    }
  end

  private

  def normalize_costs(costs)
    {
      seed: costs[:seed].to_f,
      fertilizer: costs[:fertilizer].to_f,
      chemicals: costs[:chemicals].to_f,
      labor: costs[:labor].to_f,
      total_operating: costs[:total_operating].to_f
    }
  end
end
