# frozen_string_literal: true

class ForecastProjectionService
  HORIZON_YEARS = 3
  PRICE_SPREAD = 0.05
  YIELD_SPREAD = 0.05

  def self.call(scenario)
    new(scenario).call
  end

  def initialize(scenario)
    @scenario = scenario
    @farm = scenario.farm
    @base_year = CurrentSeason.year
    @total_acres = @farm.fields.sum(:acres).to_f
  end

  def call
    return empty_payload if @total_acres.zero?

    base_operating = FarmOperatingCosts.weighted_per_acre(@farm)[:total_operating].to_f
    base_price = @scenario.commodity_price.to_f
    base_yield = @scenario.yield_assumption.to_f
    downside_price = @scenario.downside_commodity_price.to_f
    downside_yield = @scenario.downside_yield.to_f
    escalation_rate = annual_operating_escalation_rate

    years = (@base_year..(@base_year + HORIZON_YEARS - 1)).to_a
    operating_by_year = build_operating_trajectory(base_operating, years, escalation_rate)
    overrides = projection_overrides_index

    projection_rows = years.map do |year|
      offset = year - @base_year
      operating = operating_by_year[year]
      override = overrides[year] || {}
      prices = price_bands(base_price, override)
      yields = yield_bands(base_yield, override)

      {
        season_year: year,
        operating_cost_per_acre: operating.round(2),
        assumptions: {
          commodity_price: prices,
          yield_per_acre: yields,
          escalation_rate_pct: (offset.zero? ? 0.0 : (escalation_rate * 100).round(1))
        },
        margins: {
          p25: margin_case(prices[:p25], yields[:p25], operating),
          base: margin_case(prices[:base], yields[:base], operating),
          p75: margin_case(prices[:p75], yields[:p75], operating)
        },
        downside: margin_case(downside_price, downside_yield, operating),
        historical_actual: historical_row(year)
      }
    end

    {
      base_year: @base_year,
      horizon_years: HORIZON_YEARS,
      total_acres: @total_acres.round(2),
      base_operating_cost_per_acre: base_operating.round(2),
      annual_operating_escalation_pct: (escalation_rate * 100).round(1),
      escalation_sources: escalation_sources,
      years: projection_rows,
      feedback: build_feedback(projection_rows),
      disclaimer: "Forward years use benchmark trend and your scenario assumptions — planning bands, not market guarantees.",
      projected_at: Time.current.iso8601
    }
  end

  private

  def empty_payload
    {
      base_year: @base_year,
      horizon_years: HORIZON_YEARS,
      years: [],
      disclaimer: "Add fields and scenario assumptions to generate a forecast."
    }
  end

  def annual_operating_escalation_rate
    trends = BenchmarkTrendService.call(@farm)
    pct = trends[:yoy_mu_total_operating_pct]
    return (pct / 100.0) if pct.present?

    fertilizer = MacroDriver.find_by(season_year: @base_year, driver_key: "fertilizer_yoy_pct")
    return (fertilizer.value.to_f / 100.0) if fertilizer

    0.03
  end

  def escalation_sources
    sources = []
    trends = BenchmarkTrendService.call(@farm)
    sources << trends[:source] if trends[:source].present?
    fertilizer = MacroDriver.find_by(season_year: @base_year, driver_key: "fertilizer_yoy_pct")
    sources << fertilizer.source if fertilizer
    sources.compact.uniq
  end

  def build_operating_trajectory(base_operating, years, rate)
    years.index_with do |year|
      offset = year - @base_year
      base_operating * ((1 + rate)**offset)
    end
  end

  def projection_overrides_index
    Array(@scenario.projection_years).each_with_object({}) do |row, index|
      year = row["season_year"] || row[:season_year]
      index[year.to_i] = row if year.present?
    end
  end

  def price_bands(base_price, override)
    base = (override["commodity_price"] || override[:commodity_price] || base_price).to_f
    {
      p25: (base * (1 - PRICE_SPREAD)).round(2),
      base: base.round(2),
      p75: (base * (1 + PRICE_SPREAD)).round(2)
    }
  end

  def yield_bands(base_yield, override)
    base = (override["yield_assumption"] || override[:yield_assumption] || base_yield).to_f
    {
      p25: (base * (1 - YIELD_SPREAD)).round(1),
      base: base.round(1),
      p75: (base * (1 + YIELD_SPREAD)).round(1)
    }
  end

  def margin_case(price, yield_per_acre, operating)
    return nil if price.blank? || yield_per_acre.blank?

    margin_per_acre = (price.to_f * yield_per_acre.to_f) - operating.to_f
    {
      margin_per_acre: margin_per_acre.round(2),
      total_margin: (margin_per_acre * @total_acres).round(2)
    }
  end

  def historical_row(year)
    return nil if year >= @base_year

    snapshot = @farm.farm_season_snapshots.find_by(season_year: year)
    return nil unless snapshot

    snapshot.as_json(only: %i[
      season_year actual_yield actual_price actual_total_operating_per_acre notes source
    ])
  end

  def build_feedback(_projection_rows)
    latest = @farm.farm_season_snapshots.where(season_year: ...@base_year).order(season_year: :desc).first
    return [] unless latest&.actual_total_operating_per_acre.present?

    current_costs = FarmOperatingCosts.weighted_per_acre(@farm)[:total_operating].to_f
    actual_cost = latest.actual_total_operating_per_acre.to_f
    delta = actual_cost - current_costs

    [
      "#{latest.season_year} closed at $#{actual_cost.round(0)}/ac operating; this season's plan is " \
      "$#{current_costs.round(0)}/ac (#{delta.positive? ? '+' : ''}$#{delta.round(0)}/ac vs actual)."
    ]
  end
end
