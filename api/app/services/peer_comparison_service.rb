# frozen_string_literal: true

class PeerComparisonService
  CATEGORY_KEYS = %i[seed fertilizer chemicals labor total].freeze

  def self.call(scenario)
    new(scenario).call
  end

  def initialize(scenario)
    @scenario = scenario
    @farm = scenario.farm
    @season_year = CurrentSeason.year
  end

  def call
    benchmark = find_benchmark
    cohort_farms = PeerCohortSelector.call(@farm, season_year: @season_year)
    peer_data = PeerCohortAggregator.call(@farm, cohort_farms:, season_year: @season_year)
    user_costs = normalize_user_costs(peer_data[:user_costs_per_acre])
    benchmark_costs = benchmark_costs_by_category(benchmark)
    total_acres = @farm.fields.sum(:acres).to_f

    comparison_attrs = {
      benchmark_region: benchmark,
      seed_percentile: peer_data.dig(:peer_percentiles, :seed),
      fertilizer_percentile: peer_data.dig(:peer_percentiles, :fertilizer),
      chemicals_percentile: peer_data.dig(:peer_percentiles, :chemicals),
      total_cost_percentile: peer_data.dig(:peer_percentiles, :total),
      summary: build_summary(
        user_costs:,
        benchmark_costs:,
        peer_data:,
        total_acres:,
        cohort_farms:
      )
    }

    comparison = @scenario.peer_comparison || @scenario.build_peer_comparison
    comparison.update!(comparison_attrs)
    comparison
  end

  private

  def find_benchmark
    BenchmarkRegionFinder.for_farm(@farm) ||
      raise(ActiveRecord::RecordNotFound, "BenchmarkRegion not found for farm #{@farm.id}")
  end

  def benchmark_costs_by_category(benchmark)
    {
      seed: benchmark.seed_cost_per_acre.to_f,
      fertilizer: benchmark.fertilizer_cost_per_acre.to_f,
      chemicals: benchmark.chemicals_cost_per_acre.to_f,
      labor: benchmark.labor_cost_per_acre.to_f,
      total: benchmark.total_operating_cost_per_acre.to_f
    }
  end

  def normalize_user_costs(costs)
    {
      seed: costs[:seed].to_f.round(2),
      fertilizer: costs[:fertilizer].to_f.round(2),
      chemicals: costs[:chemicals].to_f.round(2),
      labor: costs[:labor].to_f.round(2),
      total: costs[:total_operating].to_f.round(2)
    }
  end

  def build_summary(user_costs:, benchmark_costs:, peer_data:, total_acres:, cohort_farms:)
    peer_costs = peer_data[:peer_costs_per_acre] || {}
    cohort_payload = {
      available: peer_data[:available],
      size: peer_data[:size],
      region: peer_data[:region],
      commodity: peer_data[:commodity],
      season_year: peer_data[:season_year],
      source: peer_data[:source]
    }

    {
      user_costs_per_acre: user_costs,
      benchmark_costs_per_acre: benchmark_costs,
      peer_costs_per_acre: peer_data[:available] ? peer_costs : nil,
      cohort: cohort_payload,
      categories: build_categories(user_costs, benchmark_costs, peer_costs, peer_data, total_acres),
      field_comparisons: FieldPeerAggregator.call(@farm, cohort_farms:, season_year: @season_year),
      margin_comparison: MarginPeerAggregator.call(@scenario, cohort_farms:),
      cost_trends: BenchmarkTrendService.call(@farm),
      total_acres: total_acres,
      compared_at: Time.current.iso8601
    }
  end

  def build_categories(user_costs, benchmark_costs, peer_costs, peer_data, total_acres)
    CATEGORY_KEYS.index_with do |key|
      user = user_costs[key].to_f
      bench = benchmark_costs[key].to_f
      peer = peer_costs[key]&.to_f
      diff_benchmark = (user - bench).round(2)
      diff_peer = peer ? (user - peer).round(2) : nil
      peer_percentile = peer_data.dig(:peer_percentiles, key)

      row = {
        user_per_acre: user,
        benchmark_per_acre: bench,
        difference_vs_benchmark_per_acre: diff_benchmark,
        flag_vs_benchmark: PeerComparisonFlags.flag_for(diff_benchmark, bench),
        total_farm_dollar_impact_vs_benchmark: (diff_benchmark * total_acres).round(0),
        difference_per_acre: peer_data[:available] ? diff_peer : diff_benchmark,
        total_farm_dollar_impact: peer_data[:available] ?
          (diff_peer.to_f * total_acres).round(0) : (diff_benchmark * total_acres).round(0),
        flag: peer_data[:available] ?
          PeerComparisonFlags.flag_for(diff_peer, peer) : PeerComparisonFlags.flag_for(diff_benchmark, bench)
      }

      if peer_data[:available] && peer
        row.merge!(
          peer_median_per_acre: peer,
          difference_vs_peer_per_acre: diff_peer,
          peer_percentile: peer_percentile,
          flag_vs_peer: PeerComparisonFlags.flag_for(diff_peer, peer),
          total_farm_dollar_impact_vs_peer: (diff_peer.to_f * total_acres).round(0)
        )
      end

      row
    end.stringify_keys
  end
end
