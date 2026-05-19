# frozen_string_literal: true

class ContextSnapshotBuilder
  def self.call(farm, scenario = nil)
    new(farm, scenario).call
  end

  def initialize(farm, scenario)
    @farm = farm
    @scenario = scenario
  end

  def call
    readiness = build_readiness
    findings = AnalystContextFindings.call(farm: @farm, scenario: @scenario, readiness:)

    {
      season_year: CurrentSeason.year,
      farm: farm_payload,
      fields: fields_payload,
      farm_operating_costs: FarmOperatingCosts.weighted_per_acre(@farm),
      regional_benchmark: regional_benchmark_payload,
      peer_cohort: peer_cohort_payload,
      scenario: scenario_payload,
      peer_comparison: @scenario&.peer_comparison&.summary,
      decision: decision_payload,
      priorities: active_priorities,
      readiness: readiness,
      key_findings: findings[:key_findings],
      data_gaps: findings[:data_gaps],
      sensitivity_summary: sensitivity_summary_payload,
      yield_context: yield_context_payload,
      cost_trends: cost_trends_payload,
      regional_risk: RegionalRiskContextService.call(@farm),
      season_snapshots: season_snapshots_payload,
      history_imports: history_imports_payload,
      forecast: forecast_payload,
      target_plan: target_plan_payload,
      underwriting: underwriting_payload,
      captured_at: Time.current.iso8601
    }
  end

  private

  def farm_payload
    @farm.as_json(only: %i[id name total_acres county region primary_commodity]).merge(
      field_count: @farm.fields.count
    )
  end

  def fields_payload
    @farm.fields.includes(:input_costs, :field_risk_profile).map do |field|
      payload = field.as_json(only: %i[id name acres soil_type primary_commodity]).merge(
        input_costs: field.input_costs.where(season_year: CurrentSeason.year).map do |cost|
          cost.as_json(only: %i[season_year category amount_per_acre notes])
        end,
        operating_costs: FieldOperatingCosts.per_acre(field)
      )
      profile = field.field_risk_profile
      if profile
        suggestion = FieldRiskSuggestionService.call(field, scenario: @scenario)
        payload[:risk_profile] = profile.as_json(only: %i[
          flood_events_last_5_years drainage bottomland risk_notes
        ])
        payload[:risk_suggestion] = suggestion if suggestion.present?
      end
      payload
    end
  end

  def scenario_payload
    return nil unless @scenario

    results = @scenario.results.is_a?(Hash) ? @scenario.results.with_indifferent_access : {}
    @scenario.as_json(only: %i[
      id name commodity_price yield_assumption downside_commodity_price
      downside_yield results
    ]).merge(
      by_field: results[:by_field],
      field_outliers: results[:field_outliers],
      macro_adjustments: results[:macro_adjustments],
      forecast: results[:forecast],
      assumptions_note: "Scenario prices and yields are farmer assumptions, not live market quotes."
    )
  end

  def decision_payload
    decision = @scenario&.decision
    return nil unless decision

    decision.as_json(only: %i[decision_type notes field_notes decided_at])
  end

  def regional_benchmark_payload
    benchmark = BenchmarkRegionFinder.for_farm(@farm)
    return nil unless benchmark

    {
      region: benchmark.region,
      commodity: benchmark.commodity,
      season_year: benchmark.season_year,
      irrigation: benchmark.irrigation,
      source: benchmark.source,
      source_url: benchmark.source_url,
      assumed_yield_bu_per_acre: benchmark.assumed_yield&.to_f,
      assumed_price_per_bu: benchmark.assumed_price&.to_f,
      costs_per_acre: {
        seed: benchmark.seed_cost_per_acre.to_f,
        fertilizer: benchmark.fertilizer_cost_per_acre.to_f,
        chemicals: benchmark.chemicals_cost_per_acre.to_f,
        labor: benchmark.labor_cost_per_acre.to_f,
        total_operating: benchmark.total_operating_cost_per_acre.to_f,
        total: benchmark.total_cost_per_acre.to_f
      },
      note: "Extension planning budget for this region — comparison baseline, not this farm's actual costs."
    }
  end

  def peer_cohort_payload
    summary = @scenario&.peer_comparison&.summary
    cohort = summary&.dig("cohort")
    return nil unless cohort.is_a?(Hash) && cohort["available"]

    {
      size: cohort["size"],
      region: cohort["region"],
      commodity: cohort["commodity"],
      season_year: cohort["season_year"],
      source: cohort["source"],
      costs_per_acre: summary["peer_costs_per_acre"],
      margin_comparison: summary["margin_comparison"],
      note: "Anonymized aggregate of Fieldmark farmers in this region and commodity — never cite individual farms."
    }
  end

  def peer_cohort_available?
    @scenario&.peer_comparison&.summary&.dig("cohort", "available") == true
  end

  def build_readiness
    costs = FarmOperatingCosts.weighted_per_acre(@farm)
    {
      has_input_costs: costs[:total_operating].positive?,
      scenario_linked: @scenario.present?,
      scenario_calculated: scenario_results?(@scenario),
      peer_comparison_available: @scenario&.peer_comparison&.summary.present?,
      peer_cohort_available: peer_cohort_available?,
      regional_benchmark_available: BenchmarkRegionFinder.for_farm(@farm).present?
    }
  end

  def scenario_results?(scenario)
    results = scenario&.results
    return false if results.blank?

    results.is_a?(Hash) && results["base_case"].present?
  end

  def sensitivity_summary_payload
    sensitivity = @scenario&.results&.dig("sensitivity") || @scenario&.results&.dig(:sensitivity)
    return nil if sensitivity.blank?

    summary = sensitivity["summary"] || sensitivity[:summary] || {}
    {
      breakeven_price_at_base_yield: summary["breakeven_price_at_base_yield"] || summary[:breakeven_price_at_base_yield],
      worst_margin_per_acre: summary["worst_margin_per_acre"] || summary[:worst_margin_per_acre],
      base_margin_per_acre: summary["base_margin_per_acre"] || summary[:base_margin_per_acre],
      note: "From scenario sensitivity grid — price × yield margin matrix."
    }
  end

  def yield_context_payload
    YieldContextService.call(@farm)
  end

  def cost_trends_payload
    trends = @scenario&.peer_comparison&.summary&.dig("cost_trends")
    trends.presence || BenchmarkTrendService.call(@farm)
  end

  def season_snapshots_payload
    @farm.farm_season_snapshots.order(season_year: :desc).map do |snapshot|
      snapshot.as_json(only: %i[
        season_year actual_yield actual_price actual_total_operating_per_acre notes source
      ])
    end
  end

  def history_imports_payload
    @farm.farm_history_imports.order(created_at: :desc).limit(3).map do |import|
      {
        id: import.id,
        status: import.status,
        filename: import.filename,
        summary: import.parsed_payload&.dig("summary") || import.applied_result&.dig("summary"),
        seasons_applied: import.applied_result&.dig("seasons_applied"),
        created_at: import.created_at.iso8601
      }
    end
  end

  def forecast_payload
    return nil unless @scenario

    forecast = @scenario.results&.dig("forecast") || @scenario.results&.dig(:forecast)
    forecast.presence || ForecastProjectionService.call(@scenario)
  end

  def underwriting_payload
    FarmUnderwritingService.call(@farm, scenario: @scenario)
  end

  def target_plan_payload
    return nil unless @scenario

    plan = @scenario.results&.dig("target_plan") || @scenario.results&.dig(:target_plan)
    return plan if plan.present?
    return nil unless @scenario.goal? || @scenario.target_total_margin.present? || @scenario.target_margin_per_acre.present?

    operating = FarmOperatingCosts.weighted_per_acre(@farm)[:total_operating].to_f
    ScenarioTargetPlanningService.call(@scenario, operating_cost_per_acre: operating)
  end

  def active_priorities
    @farm.farm_priorities.active_for_season.map do |priority|
      {
        category: priority.category,
        category_label: FarmPriority::CATEGORY_LABELS[priority.category],
        note: priority.note,
        dale_guidance: FarmPriority::DALE_GUIDANCE[priority.category.to_sym]
      }
    end
  end
end
