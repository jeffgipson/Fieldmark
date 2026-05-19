# frozen_string_literal: true

# Reverse planning: given a target farm net or $/ac margin, show what must change
# (price, yield, or operating cost) holding other levers at current scenario values.
class ScenarioTargetPlanningService
  def self.call(scenario, operating_cost_per_acre:, current_base_case: nil)
    new(scenario, operating_cost_per_acre:, current_base_case:).call
  end

  def initialize(scenario, operating_cost_per_acre:, current_base_case: nil)
    @scenario = scenario
    @farm = scenario.farm
    @operating = operating_cost_per_acre.to_f
    @total_acres = @farm.fields.sum(:acres).to_f
    @current_base = current_base_case
    @price = @scenario.commodity_price&.to_f
    @yield = @scenario.yield_assumption&.to_f
  end

  def call
    target_mpa = resolve_target_margin_per_acre
    return goal_missing_target_payload if target_mpa.nil? && @scenario.goal?
    return nil unless target_mpa

    return incomplete_payload("Add fields with acres before working from a goal.") if @total_acres.zero?

    required_revenue = target_mpa + @operating
    current_mpa = @current_base&.dig(:margin_per_acre)&.to_f || @current_base&.dig("margin_per_acre")&.to_f
    gap_mpa = current_mpa ? (target_mpa - current_mpa).round(2) : nil

    paths = build_paths(required_revenue, target_mpa)
    yield_context = YieldContextService.call(@farm)

    {
      planning_mode: @scenario.goal? ? "goal" : "forward",
      target_total_margin: target_total_margin&.round(2),
      target_margin_per_acre: target_mpa.round(2),
      total_acres: @total_acres.round(2),
      operating_cost_per_acre: @operating.round(2),
      required_revenue_per_acre: required_revenue.round(2),
      gap_margin_per_acre: gap_mpa,
      gap_total_margin: gap_mpa ? (gap_mpa * @total_acres).round(2) : nil,
      achievable: paths.any? { |p| p[:feasible] },
      paths: paths,
      yield_reference: yield_reference(yield_context),
      disclaimer: "Paths hold other levers at your current scenario assumptions — mix and match in real life; not a guarantee."
    }
  end

  private

  def resolve_target_margin_per_acre
    if @scenario.target_margin_per_acre.present?
      return @scenario.target_margin_per_acre.to_f
    end
    return nil if @scenario.target_total_margin.blank? || @total_acres.zero?

    @scenario.target_total_margin.to_f / @total_acres
  end

  def target_total_margin
    return @scenario.target_total_margin.to_f if @scenario.target_total_margin.present?

    return nil unless @scenario.target_margin_per_acre.present?

    @scenario.target_margin_per_acre.to_f * @total_acres
  end

  def build_paths(required_revenue, target_mpa)
    paths = []

    if @yield.present? && @yield.positive?
      required_price = required_revenue / @yield
      paths << path_hash(
        key: "commodity_price",
        label: "Commodity price",
        hold_label: "at your #{@yield.round(1)} bu/ac yield",
        required: required_price,
        unit: "$/bu",
        current: @price,
        feasible: required_price.positive? && required_price < 20
      )
    end

    if @price.present? && @price.positive?
      required_yield = required_revenue / @price
      paths << path_hash(
        key: "yield_assumption",
        label: "Yield",
        hold_label: "at your $#{@price.round(2)}/bu price",
        required: required_yield,
        unit: "bu/ac",
        current: @yield,
        feasible: required_yield.positive? && required_yield <= 350
      )
    end

    if @price.present? && @yield.present? && @price.positive? && @yield.positive?
      required_operating = (@price * @yield) - target_mpa
      reduction = @operating - required_operating
      paths << {
        key: "operating_cost",
        label: "Operating cost",
        hold_label: "at your current price and yield",
        required_value: required_operating.round(2),
        unit: "$/ac",
        current_value: @operating.round(2),
        change_per_acre: (-reduction).round(2),
        change_label: reduction.positive? ? "cut costs" : "room in budget",
        detail: if reduction.positive?
                  "Lower operating costs to $#{required_operating.round(0)}/ac — about $#{reduction.round(0)}/ac less than today."
                else
                  "Your current price and yield already exceed this goal at today's costs."
                end,
        feasible: required_operating.positive?
      }
    end

    paths
  end

  def path_hash(key:, label:, hold_label:, required:, unit:, current:, feasible:)
    change = current.present? && current.positive? ? (required - current).round(2) : nil
    direction = change.nil? ? nil : (change.positive? ? "increase" : "decrease")

    {
      key: key,
      label: label,
      hold_label: hold_label,
      required_value: required.round(2),
      unit: unit,
      current_value: current&.round(2),
      change: change,
      change_direction: direction,
      detail: build_path_detail(label, required, unit, hold_label, change, direction),
      feasible: feasible
    }
  end

  def build_path_detail(label, required, unit, hold_label, change, direction)
    base = "Need #{label.downcase} of #{format_value(required, unit)} #{hold_label}."
    return base if change.nil? || change.zero?

    "#{base} That is a #{direction} of #{format_value(change.abs, unit)} from your scenario."
  end

  def format_value(value, unit)
    case unit
    when "$/bu" then "$#{value.round(2)}/bu"
    when "bu/ac" then "#{value.round(1)} bu/ac"
    else "#{value.round(2)} #{unit}"
    end
  end

  def yield_reference(ctx)
    return nil unless ctx[:available] && @price.present? && @price.positive?

    required = resolve_target_margin_per_acre
    return nil unless required

    required_yield = (required + @operating) / @price
    {
      p10_yield: ctx[:p10_yield],
      average_yield: ctx[:average_yield],
      required_yield: required_yield.round(1),
      above_p10: required_yield > ctx[:p10_yield].to_f,
      note: if required_yield > ctx[:p10_yield].to_f
              "Required yield is above Missouri #{ctx[:commodity]} p10 history — a tough but explicit target."
            else
              "Required yield is at or below NASS p10 for #{ctx[:commodity]} — historically plausible, weather aside."
            end
    }
  end

  def goal_missing_target_payload
    {
      planning_mode: "goal",
      achievable: false,
      paths: [],
      disclaimer: "Enter a target farm net or target margin per acre, then calculate again."
    }
  end

  def incomplete_payload(message)
    {
      planning_mode: "goal",
      achievable: false,
      paths: [],
      disclaimer: message
    }
  end
end
