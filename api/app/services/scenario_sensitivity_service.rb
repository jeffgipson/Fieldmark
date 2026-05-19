# frozen_string_literal: true

class ScenarioSensitivityService
  GRID_SIZE = 5
  SPREAD = 0.10

  def self.call(scenario, operating_cost_override: nil)
    new(scenario, operating_cost_override:).call
  end

  def initialize(scenario, operating_cost_override: nil)
    @scenario = scenario
    @farm = scenario.farm
    @operating_cost = operating_cost_override || operating_cost_per_acre
    @base_price = @scenario.commodity_price.to_f
    @base_yield = @scenario.yield_assumption.to_f
  end

  def call
    return empty_payload if @base_price.zero? || @base_yield.zero? || @operating_cost.zero?

    price_labels = price_steps
    yield_labels = yield_steps
    grid = yield_labels.map do |y|
      price_labels.map do |p|
        margin = (p * y) - @operating_cost
        {
          price: p.round(2),
          yield_per_acre: y.round(1),
          margin_per_acre: margin.round(2),
          is_base: (p - @base_price).abs < 0.01 && (y - @base_yield).abs < 0.1
        }
      end
    end

    margins = grid.flatten.pluck(:margin_per_acre)

    {
      price_labels: price_labels.map { |p| p.round(2) },
      yield_labels: yield_labels.map { |y| y.round(1) },
      grid: grid,
      summary: build_summary(margins)
    }
  end

  private

  def empty_payload
    { price_labels: [], yield_labels: [], grid: [], summary: {} }
  end

  def operating_cost_per_acre
    FarmOperatingCosts.weighted_per_acre(@farm)[:total_operating].to_f.round(2)
  end

  def price_steps
    step = (@base_price * SPREAD) / 2
    (0...GRID_SIZE).map { |i| @base_price + ((i - (GRID_SIZE / 2)) * step) }
  end

  def yield_steps
    step = (@base_yield * SPREAD) / 2
    (0...GRID_SIZE).map { |i| @base_yield + ((i - (GRID_SIZE / 2)) * step) }
  end

  def build_summary(margins)
    worst = margins.min
    base_margin = (@base_price * @base_yield) - @operating_cost
    breakeven = breakeven_price_at_yield(@base_yield)

    {
      base_margin_per_acre: base_margin.round(2),
      worst_margin_per_acre: worst&.round(2),
      breakeven_price_at_base_yield: breakeven&.round(2),
      operating_cost_per_acre: @operating_cost
    }
  end

  def breakeven_price_at_yield(yield_per_acre)
    return nil if yield_per_acre.zero?

    (@operating_cost / yield_per_acre).round(4)
  end
end
