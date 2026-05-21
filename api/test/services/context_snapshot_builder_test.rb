# frozen_string_literal: true

require "test_helper"

class ContextSnapshotBuilderTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  test "includes benchmark, costs, readiness, and findings" do
    farm = farms(:henderson)
    scenario = scenarios(:base_case)
    PeerComparisonService.call(scenario)

    snapshot = ContextSnapshotBuilder.call(farm, scenario.reload)

    assert_equal CurrentSeason.year, snapshot[:season_year]
    assert snapshot[:regional_benchmark].present?
    assert_equal "Extension 2026", snapshot[:regional_benchmark][:source]
    assert snapshot[:peer_cohort].present?
    assert snapshot[:peer_cohort][:size] >= PeerCohortSelector::MIN_COHORT_SIZE
    assert snapshot[:farm_operating_costs][:seed].positive?
    assert snapshot[:readiness][:has_input_costs]
    assert snapshot[:readiness][:scenario_linked]
    assert snapshot[:readiness][:peer_cohort_available]
    assert snapshot[:key_findings].is_a?(Array)
    assert snapshot[:yield_context].present?
    assert snapshot[:regional_risk].present?
    assert_includes snapshot[:regional_risk].keys, :live
    assert snapshot[:sensitivity_summary].nil? || snapshot[:sensitivity_summary].key?(:breakeven_price_at_base_yield)
    assert snapshot[:app_guide].present?
    assert snapshot[:app_guide][:common_tasks].any? { |t| t[:id] == "import_csv_margin_history" }
  end

  test "flags missing data when farm has no costs" do
    farm = farms(:henderson)
    InputCost.where(field_id: farm.field_ids).delete_all
    scenario = scenarios(:base_case)

    snapshot = ContextSnapshotBuilder.call(farm, scenario)

    assert_not snapshot[:readiness][:has_input_costs]
    assert snapshot[:data_gaps].any? { |g| g.include?("input costs") }
  end
end
