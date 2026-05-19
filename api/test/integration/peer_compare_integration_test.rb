# frozen_string_literal: true

require "test_helper"

class PeerCompareIntegrationTest < ActionDispatch::IntegrationTest
  include ApiTestHelpers

  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  test "compare returns peer cohort stats" do
    token = login_user!(email: users(:one).email)
    headers = api_headers(token)
    farm = farms(:henderson)
    scenario = scenarios(:base_case)

    post "/api/v1/farms/#{farm.id}/scenarios/#{scenario.id}/compare",
         headers: headers,
         as: :json
    assert_api_success
    summary = api_data.dig("peer_comparison", "summary")
    assert summary.dig("cohort", "available")
    assert summary["peer_costs_per_acre"].present?
    assert summary.dig("categories", "seed", "peer_median_per_acre").present?
    assert summary["margin_comparison"].present?
    assert summary["field_comparisons"].present?
  end
end
