# frozen_string_literal: true

class BenchmarkTrendService
  CATEGORY_KEYS = %i[seed fertilizer chemicals labor total].freeze

  def self.call(farm, season_years: nil)
    new(farm, season_years:).call
  end

  def initialize(farm, season_years: nil)
    @farm = farm
    @season_years = season_years || default_years
  end

  def call
    benchmarks = benchmarks_by_year
    return empty_payload if benchmarks.size < 2

    years_payload = @season_years.filter_map do |year|
      bench = benchmarks[year]
      next unless bench

      {
        season_year: year,
        mu_total_operating_per_acre: bench.total_operating_cost_per_acre.to_f.round(2),
        user_total_operating_per_acre: user_total_for_year(year)&.round(2)
      }
    end

    current = benchmarks[@season_years.max]
    prior = benchmarks[@season_years.max - 1]
    yoy_mu = pct_change(prior&.total_operating_cost_per_acre, current&.total_operating_cost_per_acre)

    {
      source: current&.source || "Extension",
      years: years_payload,
      yoy_mu_total_operating_pct: yoy_mu,
      category_yoy: category_yoy_rows(benchmarks)
    }
  end

  private

  def default_years
    [CurrentSeason.year - 2, CurrentSeason.year - 1, CurrentSeason.year]
  end

  def empty_payload
    { source: nil, years: [], yoy_mu_total_operating_pct: nil, category_yoy: [] }
  end

  def benchmarks_by_year
    @season_years.index_with do |year|
      BenchmarkRegionFinder.for_farm(@farm, season_year: year)
    end.compact
  end

  def user_total_for_year(year)
    totals = Hash.new(0.0)
    total_acres = @farm.fields.sum(:acres).to_f
    return nil if total_acres.zero?

    @farm.fields.includes(:input_costs).find_each do |field|
      weight = field.acres.to_f / total_acres
      field.input_costs.where(season_year: year).find_each do |cost|
        totals[cost.category] += cost.amount_per_acre.to_f * weight
      end
    end

    return nil if totals.empty?

    totals.values.sum
  end

  def category_yoy_rows(benchmarks)
    current_year = @season_years.max
    prior_year = current_year - 1
    current = benchmarks[current_year]
    prior = benchmarks[prior_year]
    return [] unless current && prior

    CATEGORY_KEYS.map do |key|
      current_val = benchmark_category(current, key)
      prior_val = benchmark_category(prior, key)
      user_current = user_category_for_year(current_year, key)
      user_prior = user_category_for_year(prior_year, key)

      {
        category: key.to_s,
        mu_pct_change: pct_change(prior_val, current_val),
        user_pct_change: pct_change(user_prior, user_current)
      }
    end
  end

  def benchmark_category(benchmark, key)
    case key
    when :seed then benchmark.seed_cost_per_acre
    when :fertilizer then benchmark.fertilizer_cost_per_acre
    when :chemicals then benchmark.chemicals_cost_per_acre
    when :labor then benchmark.labor_cost_per_acre
    when :total then benchmark.total_operating_cost_per_acre
    end
  end

  def user_category_for_year(year, key)
    return nil if key == :total

    total_acres = @farm.fields.sum(:acres).to_f
    return nil if total_acres.zero?

    total = 0.0
    @farm.fields.includes(:input_costs).find_each do |field|
      weight = field.acres.to_f / total_acres
      cost = field.input_costs.find_by(season_year: year, category: key)
      total += cost.amount_per_acre.to_f * weight if cost
    end
    total.positive? ? total : nil
  end

  def pct_change(from, to)
    from = from.to_f
    to = to.to_f
    return nil if from.zero?

    (((to - from) / from) * 100).round(1)
  end
end
