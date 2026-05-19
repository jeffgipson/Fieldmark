# frozen_string_literal: true

# Deterministic "moderate risk" read — lender / crop-insurance file-prep lens, not a quote or approval.
# Aggregates map, costs, scenarios, peers, macro, and field risk into scored pillars.
class FarmUnderwritingService
  RATINGS = %w[favorable moderate elevated insufficient_data].freeze
  STATUSES = %w[favorable watch concern unknown].freeze

  def self.call(farm, scenario: nil)
    new(farm, scenario:).call
  end

  def initialize(farm, scenario:)
    @farm = farm
    @scenario = scenario
    @season_year = CurrentSeason.year
    @fields = @farm.fields.includes(:field_risk_profile).to_a
    @results = scenario_results
    @peer_summary = @scenario&.peer_comparison&.summary
    @mapped_acres = @fields.sum { |f| f.acres.to_f }
    @profile_acres = @farm.total_acres.to_f
  end

  def call
    pillars = [
      property_pillar,
      production_pillar,
      financial_pillar,
      market_pillar,
      file_completeness_pillar
    ]

    factors = pillars.flat_map { |p| p[:factors] }
    concern_count = factors.count { |f| f[:status] == "concern" }
    watch_count = factors.count { |f| f[:status] == "watch" }
    unknown_count = factors.count { |f| f[:status] == "unknown" }

    rating = overall_rating(concern_count:, watch_count:, unknown_count:)
    confidence = confidence_level(unknown_count:, pillars:)

    {
      season_year: @season_year,
      rating: rating,
      confidence: confidence,
      rating_label: rating_label(rating),
      summary: build_summary(rating:, concern_count:, watch_count:),
      pillars: pillars,
      concern_count: concern_count,
      watch_count: watch_count,
      disclaimer: underwriting_disclaimer,
      scored_at: Time.current.iso8601
    }
  end

  private

  def scenario_results
    return nil unless @scenario&.results.is_a?(Hash)

    @scenario.results.with_indifferent_access
  end

  def property_pillar
    factors = []
    factors << mapped_acres_factor
    factors << boundary_coverage_factor
    factors << location_factor
    factors << regional_context_factor

    pillar("property", "Property & location", factors)
  end

  def production_pillar
    factors = []
    factors << field_hazard_factor
    factors << downside_margin_factor
    factors << yield_assumption_factor
    factors << field_concentration_factor

    pillar("production", "Production risk", factors)
  end

  def financial_pillar
    factors = []
    factors << cost_vs_benchmark_factor
    factors << margin_vs_peers_factor
    factors << sensitivity_factor
    factors << operating_cost_trend_factor

    pillar("financial", "Margin & costs", factors)
  end

  def market_pillar
    factors = []
    factors << macro_pressure_factor
    factors << forecast_outlook_factor
    factors << prior_season_actuals_factor

    pillar("market", "Market & carry", factors)
  end

  def file_completeness_pillar
    factors = []
    factors << input_costs_factor
    factors << scenario_factor
    factors << peer_file_factor

    pillar("file", "File completeness", factors)
  end

  def pillar(key, label, factors)
    statuses = factors.map { |f| f[:status] }
    rating = pillar_rating(statuses)

    { key: key, label: label, rating: rating, factors: factors }
  end

  def pillar_rating(statuses)
    return "unknown" if statuses.all?("unknown")
    return "elevated" if statuses.include?("concern")
    return "moderate" if statuses.include?("watch")

    "favorable"
  end

  def mapped_acres_factor
    if @profile_acres.zero?
      return factor(
        key: "mapped_acres",
        label: "Acreage reconciliation",
        status: "unknown",
        detail: "Farm profile acres are not set — reconcile mapped fields to profile acres."
      )
    end

    delta = (@mapped_acres - @profile_acres).abs
    reconciled = delta < 0.01

    status = reconciled ? "favorable" : (delta / @profile_acres > 0.1 ? "concern" : "watch")
    detail = if reconciled
               "#{@mapped_acres.round(0)} mapped acres match the #{@profile_acres.round(0)} ac farm profile."
             else
               "#{@mapped_acres.round(0)} mapped vs #{@profile_acres.round(0)} profile acres (#{delta.round(0)} ac gap)."
             end

    factor(key: "mapped_acres", label: "Acreage reconciliation", status: status, detail: detail, source: "Field boundaries")
  end

  def boundary_coverage_factor
    with_boundary = @fields.count { |f| f.boundary.present? }
    total = @fields.size
    return factor(
      key: "boundary_coverage",
      label: "Mapped fields",
      status: "unknown",
      detail: "No fields on file — map boundaries improve collateral and hazard review."
    ) if total.zero?

    pct = (with_boundary.to_f / total * 100).round(0)
    status = if pct >= 80
               "favorable"
             elsif pct >= 40
               "watch"
             else
               "concern"
             end

    factor(
      key: "boundary_coverage",
      label: "Mapped fields",
      status: status,
      detail: "#{with_boundary} of #{total} fields have boundary polygons (#{pct}%).",
      source: "Field map"
    )
  end

  def location_factor
    if @farm.latitude.present? && @farm.longitude.present?
      county = @farm.county.presence || "county not set"
      return factor(
        key: "location",
        label: "Geolocation",
        status: "favorable",
        detail: "Farm centroid pinned in #{county}, #{format_region(@farm.region)} Missouri.",
        source: "Farm map"
      )
    end

    factor(
      key: "location",
      label: "Geolocation",
      status: "watch",
      detail: "No farm pin on map — location context uses region and county only.",
      source: "Farm profile"
    )
  end

  def regional_context_factor
    ctx = RegionalRiskContextService.call(@farm)
    region = @farm.region.to_s
    status = region == "southwest" ? "watch" : "favorable"

    factor(
      key: "regional_context",
      label: "Regional conditions",
      status: status,
      detail: ctx[:message],
      source: ctx[:source],
      source_url: ctx[:source_url]
    )
  end

  def field_hazard_factor
    flagged = @fields.select do |f|
      p = f.field_risk_profile
      next false unless p

      (p.flood_events_last_5_years.to_i >= 3) || p.bottomland? || p.poor?
    end

    if flagged.empty? && @fields.none? { |f| f.field_risk_profile.present? }
      return factor(
        key: "field_hazards",
        label: "Per-field hazards",
        status: "watch",
        detail: "No flood or drainage profiles on file — hazard review is incomplete.",
        source: "Field risk profile"
      )
    end

    if flagged.empty?
      return factor(
        key: "field_hazards",
        label: "Per-field hazards",
        status: "favorable",
        detail: "No fields flagged for repeated flood, bottomland, or poor drainage.",
        source: "Field risk profile"
      )
    end

    names = flagged.map(&:name).first(3).join(", ")
    extra = flagged.size > 3 ? " (+#{flagged.size - 3} more)" : ""
    status = flagged.size >= 2 ? "concern" : "watch"

    factor(
      key: "field_hazards",
      label: "Per-field hazards",
      status: status,
      detail: "#{flagged.size} field(s) carry hazard flags: #{names}#{extra}.",
      source: "Field risk profile"
    )
  end

  def downside_margin_factor
    down = @results&.dig(:downside_case)
    return factor(
      key: "downside_margin",
      label: "Downside margin",
      status: "unknown",
      detail: "Run scenario calculate to stress-test revenue at your downside price and yield.",
      source: "Scenario"
    ) if down.blank?

    margin = down[:margin_per_acre].to_f
    status = if margin.negative?
               "concern"
             elsif margin < 50
               "watch"
             else
               "favorable"
             end

    factor(
      key: "downside_margin",
      label: "Downside margin",
      status: status,
      detail: "Farm-wide downside net margin is $#{margin.round(2)}/ac ($#{down[:total_margin].to_f.round(0)} total).",
      source: "Scenario calculator"
    )
  end

  def yield_assumption_factor
    return factor(
      key: "yield_assumption",
      label: "Yield vs history",
      status: "unknown",
      detail: "Set scenario yield assumptions to compare against USDA NASS history.",
      source: "Scenario"
    ) unless @scenario&.yield_assumption.present?

    ctx = YieldContextService.call(@farm)
    return factor(
      key: "yield_assumption",
      label: "Yield vs history",
      status: "unknown",
      detail: ctx[:note] || "USDA yield history unavailable for this commodity.",
      source: "USDA NASS"
    ) unless ctx[:available]

    assumed = @scenario.yield_assumption.to_f
    p10 = ctx[:p10_yield].to_f
    avg = ctx[:average_yield].to_f

    status = if assumed <= p10
               "favorable"
             elsif assumed <= avg
               "watch"
             else
               "watch"
             end

    detail = "Base yield #{assumed} bu/ac vs MO #{ctx[:commodity]} 5-yr avg #{avg} and p10 #{p10} bu/ac."

    factor(
      key: "yield_assumption",
      label: "Yield vs history",
      status: status,
      detail: detail,
      source: ctx[:source],
      source_url: ctx[:source_url]
    )
  end

  def field_concentration_factor
    spread = @results&.dig(:field_outliers, :base_margin_spread_per_acre)
    return factor(
      key: "field_concentration",
      label: "Margin by field",
      status: "unknown",
      detail: "Calculate scenario to see whether one field drives most of the farm margin.",
      source: "Scenario"
    ) if spread.blank?

    spread_f = spread.to_f
    status = spread_f >= 80 ? "concern" : (spread_f >= 50 ? "watch" : "favorable")

    factor(
      key: "field_concentration",
      label: "Margin by field",
      status: status,
      detail: "Base margin spread across fields is $#{spread_f.round(0)}/ac — wide spreads may need field-level decisions.",
      source: "Scenario by-field"
    )
  end

  def cost_vs_benchmark_factor
    categories = @peer_summary&.dig("categories")
    return factor(
      key: "cost_vs_benchmark",
      label: "Operating costs vs MU budget",
      status: "unknown",
      detail: "Run peer comparison to position costs against Extension benchmarks.",
      source: "Peer comparison"
    ) unless categories.is_a?(Hash)

    total = categories["total"] || categories[:total]
    return factor(
      key: "cost_vs_benchmark",
      label: "Operating costs vs MU budget",
      status: "unknown",
      detail: "Total operating cost comparison unavailable.",
      source: "MU Extension"
    ) unless total.is_a?(Hash)

    diff = (total["difference_vs_benchmark_per_acre"] || total[:difference_vs_benchmark_per_acre]).to_f
    flag = total["flag_vs_benchmark"] || total[:flag_vs_benchmark]

    status = case flag.to_s
             when "above" then diff > 40 ? "concern" : "watch"
             when "below" then "favorable"
             else "favorable"
             end

    factor(
      key: "cost_vs_benchmark",
      label: "Operating costs vs MU budget",
      status: status,
      detail: "Weighted operating costs are $#{diff.abs.round(0)}/ac #{diff.positive? ? 'above' : 'below'} the MU planning budget.",
      source: "MU Extension 2026"
    )
  end

  def margin_vs_peers_factor
    margin = @peer_summary&.dig("margin_comparison")
    return factor(
      key: "margin_vs_peers",
      label: "Margin vs peers",
      status: "unknown",
      detail: "Peer margin band requires calculated scenario and compare.",
      source: "Peer cohort"
    ) unless margin.is_a?(Hash) && margin["available"]

    percentile = margin["base_margin_peer_percentile"]
    return factor(
      key: "margin_vs_peers",
      label: "Margin vs peers",
      status: "watch",
      detail: "Peer cohort too small for margin percentile — benchmark costs still apply.",
      source: margin["source"] || "Fieldmark peers"
    ) if percentile.nil?

    pct = percentile.to_f
    status = if pct < 35
               "concern"
             elsif pct < 50
               "watch"
             else
               "favorable"
             end

    factor(
      key: "margin_vs_peers",
      label: "Margin vs peers",
      status: status,
      detail: "Base-case margin is at the #{pct.round(0)}th percentile vs #{margin['cohort_size']} anonymized peer farms.",
      source: margin["source"] || "Fieldmark peers"
    )
  end

  def sensitivity_factor
    sensitivity = @results&.dig(:sensitivity, :summary) || @results&.dig("sensitivity", "summary")
    return factor(
      key: "sensitivity",
      label: "Price × yield stress",
      status: "unknown",
      detail: "Calculate scenario to populate the sensitivity grid.",
      source: "Scenario"
    ) if sensitivity.blank?

    worst = (sensitivity[:worst_margin_per_acre] || sensitivity["worst_margin_per_acre"]).to_f
    breakeven = sensitivity[:breakeven_price_at_base_yield] || sensitivity["breakeven_price_at_base_yield"]

    status = worst.negative? ? "concern" : (worst < 75 ? "watch" : "favorable")
    detail = "Sensitivity grid worst case $#{worst.round(0)}/ac"
    detail += "; breakeven near $#{breakeven.to_f.round(2)}/bu at base yield" if breakeven.present?

    factor(key: "sensitivity", label: "Price × yield stress", status: status, detail: "#{detail}.", source: "Scenario sensitivity")
  end

  def operating_cost_trend_factor
    trends = BenchmarkTrendService.call(@farm)
    pct = trends[:yoy_mu_total_operating_pct]
    return factor(
      key: "cost_trend",
      label: "Input cost trend",
      status: "unknown",
      detail: "MU year-over-year trend unavailable.",
      source: "MU Extension"
    ) if pct.nil?

    status = pct > 4 ? "watch" : "favorable"
    factor(
      key: "cost_trend",
      label: "Input cost trend",
      status: status,
      detail: "MU total operating costs rose #{pct.round(1)}% year-over-year in benchmark data.",
      source: trends[:source] || "MU Extension"
    )
  end

  def macro_pressure_factor
    macro = MacroImpactService.call(@farm, season_year: @season_year)
    bump = macro[:total_suggested_bump_per_acre].to_f
    drivers = macro[:drivers] || []

    if drivers.empty?
      return factor(
        key: "macro",
        label: "Fuel & input inflation",
        status: "unknown",
        detail: "Macro drivers not seeded for this season — run db:seed or demo reset.",
        source: "Macro drivers"
      )
    end

    status = bump >= 15 ? "concern" : (bump >= 8 ? "watch" : "favorable")
    diesel = drivers.find { |d| d[:driver_key] == "diesel_price_per_gallon" }

    detail = "Suggested macro stress-test adds $#{bump.round(0)}/ac to operating costs"
    detail += " (diesel $#{diesel[:value]}/gal vs planning baseline)" if diesel

    factor(
      key: "macro",
      label: "Fuel & input inflation",
      status: status,
      detail: "#{detail}.",
      source: "Seeded macro drivers",
      source_url: diesel&.dig(:source_url)
    )
  end

  def forecast_outlook_factor
    forecast = @results&.dig(:forecast)
    return factor(
      key: "forecast",
      label: "Multi-year outlook",
      status: "unknown",
      detail: "Three-year forecast appears after scenario calculate.",
      source: "Forecast projection"
    ) if forecast.blank?

    years = Array(forecast[:years] || forecast["years"])
    negative_years = years.count do |y|
      (y.dig(:downside, :total_margin) || y.dig("downside", "total_margin")).to_f.negative?
    end

    status = negative_years >= 2 ? "concern" : (negative_years == 1 ? "watch" : "favorable")
    feedback = Array(forecast[:feedback] || forecast["feedback"]).first

    detail = "#{negative_years} of #{years.size} forward years show negative downside farm margin in the roll-forward."
    detail = "#{feedback} #{detail}" if feedback.present?

    factor(key: "forecast", label: "Multi-year outlook", status: status, detail: detail, source: "Forecast projection")
  end

  def prior_season_actuals_factor
    snapshots = @farm.farm_season_snapshots.order(season_year: :desc).limit(1).first
    return factor(
      key: "prior_actuals",
      label: "Prior-season actuals",
      status: "watch",
      detail: "No closed-book season on file — lenders often want last year's operating $/ac and yield.",
      source: "Season snapshots"
    ) unless snapshots

    factor(
      key: "prior_actuals",
      label: "Prior-season actuals",
      status: "favorable",
      detail: "#{snapshots.season_year} actuals recorded — usable for plan-vs-actual and next-year feedback.",
      source: "Season snapshots"
    )
  end

  def input_costs_factor
    costs = FarmOperatingCosts.weighted_per_acre(@farm, season_year: @season_year)
    if costs[:total_operating].positive?
      return factor(
        key: "input_costs",
        label: "Input costs entered",
        status: "favorable",
        detail: "Operating costs entered for #{@season_year} ($#{costs[:total_operating].round(0)}/ac weighted).",
        source: "Input costs"
      )
    end

    factor(
      key: "input_costs",
      label: "Input costs entered",
      status: "concern",
      detail: "No operating costs on file for the planning season.",
      source: "Input costs"
    )
  end

  def scenario_factor
    if @results&.dig(:base_case).present?
      base = @results[:base_case][:margin_per_acre].to_f
      return factor(
        key: "scenario",
        label: "Margin scenario",
        status: base.positive? ? "favorable" : "watch",
        detail: "Base case modeled at $#{base.round(0)}/ac net margin.",
        source: "Scenario"
      )
    end

    factor(
      key: "scenario",
      label: "Margin scenario",
      status: "concern",
      detail: "Scenario not calculated — underwriting file is incomplete without base and downside cases.",
      source: "Scenario"
    )
  end

  def peer_file_factor
    return factor(
      key: "peer_file",
      label: "Peer comparison",
      status: "unknown",
      detail: "Run compare on the scenario to add benchmark and peer positioning.",
      source: "Peer comparison"
    ) unless @peer_summary.present?

    cohort = @peer_summary["cohort"] || @peer_summary[:cohort]
    if cohort.is_a?(Hash) && cohort["available"]
      factor(
        key: "peer_file",
        label: "Peer comparison",
        status: "favorable",
        detail: "Compared against #{cohort['size']} anonymized peer farms in #{format_region(@farm.region)}.",
        source: cohort["source"] || "Fieldmark peers"
      )
    else
      factor(
        key: "peer_file",
        label: "Peer comparison",
        status: "watch",
        detail: "Extension benchmarks on file; anonymized peer cohort not yet available for this region.",
        source: "MU Extension"
      )
    end
  end

  def factor(key:, label:, status:, detail:, source: nil, source_url: nil)
    {
      key: key,
      label: label,
      status: status,
      detail: detail,
      source: source,
      source_url: source_url
    }.compact
  end

  def overall_rating(concern_count:, watch_count:, unknown_count:)
    costs = FarmOperatingCosts.weighted_per_acre(@farm, season_year: @season_year)
    return "insufficient_data" unless costs[:total_operating].positive? && @results&.dig(:base_case).present?

    return "elevated" if concern_count >= 3
    return "elevated" if concern_count >= 1 && watch_count >= 2
    return "elevated" if downside_margin_concern?

    return "favorable" if concern_count.zero? && watch_count <= 1
    return "favorable" if concern_count.zero? && watch_count <= 2 && moderate_base_margin?

    "moderate"
  end

  def downside_margin_concern?
    margin = @results&.dig(:downside_case, :margin_per_acre)
    margin.present? && margin.to_f.negative?
  end

  def moderate_base_margin?
    @results&.dig(:base_case, :margin_per_acre).to_f >= 100
  end

  def confidence_level(unknown_count:, pillars:)
    unknown_pillars = pillars.count { |p| p[:rating] == "unknown" }
    return "low" if unknown_pillars >= 2 || unknown_count >= 8
    return "partial" if unknown_count >= 3 || unknown_pillars == 1

    "high"
  end

  def rating_label(rating)
    {
      "favorable" => "Favorable",
      "moderate" => "Moderate risk",
      "elevated" => "Elevated risk",
      "insufficient_data" => "Insufficient data"
    }[rating] || rating
  end

  def build_summary(rating:, concern_count:, watch_count:)
    case rating
    when "insufficient_data"
      "Finish your cost file and scenario before a lender meeting — you will not yet see what they are likely to ask about."
    when "elevated"
      "Expect a harder conversation (#{concern_count} concern, #{watch_count} watch) — know your downside margin and hazard story before you sit down with the lender."
    when "favorable"
      "A complete file with few stress flags — you can walk in knowing where you are strong; still bring your downside case."
    else
      "A typical planning file (#{concern_count} concern, #{watch_count} watch) — you should know which topics the lender will probe before March commitments."
    end
  end

  def underwriting_disclaimer
    "Planning read only — not a loan approval or insurance quote. " \
      "Use it to anticipate lender questions; prices and yields stay your assumptions."
  end

  def format_region(region)
    region.to_s.tr("_", " ").capitalize
  end
end
