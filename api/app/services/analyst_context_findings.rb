# frozen_string_literal: true

class AnalystContextFindings
  MAX_FINDINGS = 5

  def self.call(farm:, scenario: nil, readiness: {})
    new(farm:, scenario:, readiness:).call
  end

  def initialize(farm:, scenario:, readiness:)
    @farm = farm
    @scenario = scenario
    @readiness = readiness
  end

  def call
    {
      key_findings: build_key_findings.first(MAX_FINDINGS),
      data_gaps: build_data_gaps
    }
  end

  private

  def build_key_findings
    findings = []
    findings.concat(peer_comparison_findings)
    findings.concat(margin_peer_findings)
    findings.concat(scenario_margin_findings)
    findings.concat(field_margin_spread_findings)
    findings.concat(forecast_feedback_findings)
    findings << default_ready_message if findings.empty? && @readiness[:scenario_calculated]
    findings
  end

  def peer_comparison_findings
    summary = @scenario&.peer_comparison&.summary
    categories = summary&.dig("categories")
    return [] unless categories.is_a?(Hash)

    cohort_available = summary.dig("cohort", "available") == true
    cohort_size = summary.dig("cohort", "size")

    findings = []
    %w[fertilizer seed chemicals].each do |key|
      row = categories[key]
      next unless row.is_a?(Hash)

      label = key.tr("_", " ")
      diff_benchmark = row["difference_vs_benchmark_per_acre"].to_f
      diff_peer = row["difference_vs_peer_per_acre"].to_f

      if cohort_available && diff_peer.positive?
        impact = row["total_farm_dollar_impact_vs_peer"].to_f
        percentile = row["peer_percentile"]
        findings << "#{label.capitalize} runs $#{diff_peer.round(0)}/ac above the peer median " \
                    "(#{percentile.to_i}th percentile among #{cohort_size} farms) — about " \
                    "$#{impact.round(0).to_fs(:delimited)} across the farm."
      elsif diff_benchmark.positive?
        impact = row["total_farm_dollar_impact_vs_benchmark"].to_f
        findings << "#{label.capitalize} runs $#{diff_benchmark.round(0)}/ac above the Extension " \
                    "planning budget — about $#{impact.round(0).to_fs(:delimited)} across the farm."
      end
    end
    findings
  end

  def margin_peer_findings
    margin = @scenario&.peer_comparison&.summary&.dig("margin_comparison")
    return [] unless margin.is_a?(Hash) && margin["available"]

    user_base = margin["user_base_margin_per_acre"]
    peer_median = margin["peer_median_base_margin_per_acre"]
    percentile = margin["base_margin_peer_percentile"]
    cohort_size = margin["cohort_size"]
    return [] if user_base.nil? || peer_median.nil?

    diff = user_base.to_f - peer_median.to_f
    direction = diff.positive? ? "above" : "below"
    [
      "Base-case margin is $#{user_base.to_f.round(0)}/ac, #{direction} the peer median of " \
      "$#{peer_median.to_f.round(0)}/ac (#{percentile.to_i}th percentile among #{cohort_size} farms)."
    ]
  end

  def scenario_margin_findings
    results = @scenario&.results
    return [] unless results.is_a?(Hash)

    base = results["base_case"]
    downside = results["downside_case"]
    return [] unless base.is_a?(Hash) && downside.is_a?(Hash)
    return [] if base["margin_per_acre"].nil? || downside["margin_per_acre"].nil?

    [
      "Downside scenario leaves $#{downside['margin_per_acre']}/ac margin vs " \
      "$#{base['margin_per_acre']}/ac base case — worth validating before March commitments."
    ]
  end

  FIELD_MARGIN_SPREAD_THRESHOLD = 50.0

  def field_margin_spread_findings
    results = @scenario&.results
    return [] unless results.is_a?(Hash)

    outliers = results["field_outliers"] || results[:field_outliers]
    spread = outliers&.dig("base_margin_spread_per_acre") || outliers&.dig(:base_margin_spread_per_acre)
    return [] if spread.blank? || spread.to_f < FIELD_MARGIN_SPREAD_THRESHOLD

    by_field = results["by_field"] || results[:by_field]
    return [] unless by_field.is_a?(Array) && by_field.size > 1

    lowest_id = outliers["lowest_base_margin_field_id"] || outliers[:lowest_base_margin_field_id]
    lowest = by_field.find { |row| row["field_id"] == lowest_id || row[:field_id] == lowest_id }
    return [] unless lowest

    name = lowest["field_name"] || lowest[:field_name]
    margin = lowest.dig("base_case", "margin_per_acre") || lowest.dig(:base_case, :margin_per_acre)
    [
      "Field margins vary by $#{spread.to_f.round(0)}/ac across the farm — #{name} is the lowest at " \
      "$#{margin.to_f.round(0)}/ac base case. March commitments may need to differ by field."
    ]
  end

  def forecast_feedback_findings
    forecast = @scenario&.results
    return [] unless forecast.is_a?(Hash)

    feedback = forecast.dig("forecast", "feedback") || forecast.dig(:forecast, :feedback)
    return [] unless feedback.is_a?(Array) && feedback.any?

    feedback.first(1)
  end

  def default_ready_message
    "Scenario and cost comparison are in the app — use those numbers when advising on March inputs."
  end

  def build_data_gaps
    gaps = []
    season = CurrentSeason.year

    unless @readiness[:has_input_costs]
      gaps << "No #{season} input costs on file — ask the farmer to enter per-field costs before dollar comparisons."
    end
    unless @readiness[:scenario_linked]
      gaps << "No scenario linked to this chat — margin tables require a scenario with price and yield assumptions."
    end
    if @readiness[:scenario_linked] && !@readiness[:scenario_calculated]
      gaps << "Scenario is not calculated — tell the farmer to run Calculate on their scenario before margin answers."
    end
    if @readiness[:scenario_linked] && !@readiness[:peer_comparison_available]
      gaps << "Peer comparison not run — tell the farmer to compare costs on the Benchmark page before percentile claims."
    end
    if @readiness[:peer_comparison_available] && !@readiness[:peer_cohort_available]
      gaps << "Peer cohort too small for anonymized stats — cite Extension benchmarks only; do not invent peer averages."
    end
    unless @readiness[:regional_benchmark_available]
      gaps << "Extension benchmark row missing for this farm region/commodity — do not invent peer averages."
    end

    gaps << boundary_message if gaps.empty?
    gaps
  end

  def boundary_message
    "Fieldmark does not store crop insurance, tax, marketing, or agronomy plans — defer those to the farmer's agent or lender."
  end
end
