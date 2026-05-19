# frozen_string_literal: true

require "test_helper"

class ApiSmokeTest < ActionDispatch::IntegrationTest
  include ApiTestHelpers
  include ActiveJob::TestHelper

  test "health check" do
    get "/api/health"
    assert_response :success
    assert_equal "ok", json_body["data"]["status"]
  end

  test "demo login creates demo user and returns token" do
    post "/api/v1/auth/demo", headers: api_headers, as: :json
    assert_api_success
    assert_equal AppConfig.demo_email, api_data["email"]
    assert api_data["token"].present?
    assert User.exists?(email: AppConfig.demo_email)
  end

  test "locations boundaries is public and returns an array" do
    get "/api/v1/locations/boundaries",
        params: { south: 37.28, west: -89.65, north: 37.32, east: -89.58 }
    assert_api_success
    assert_kind_of Array, api_data
    assert json_body.dig("meta", "sources", "openstreetmap")
  end

  test "register farm scenario and calculate" do
    auth = register_user!
    headers = api_headers(auth[:token])

    post "/api/v1/farms",
         params: {
           farm: {
             name: "Test Farm",
             total_acres: 500,
             county: "Cape Girardeau",
             region: "central",
             primary_commodity: "corn"
           }
         },
         headers: headers,
         as: :json
    assert_api_success(:created)
    farm_id = api_data["id"]

    post "/api/v1/farms/#{farm_id}/fields",
         params: {
           field: { name: "North 40", acres: 40, soil_type: "Silt loam", primary_commodity: "corn" }
         },
         headers: headers,
         as: :json
    assert_api_success(:created)
    field_id = api_data["id"]

    post "/api/v1/fields/#{field_id}/input_costs",
         params: {
           input_cost: {
             season_year: CurrentSeason.year,
             category: "seed",
             amount_per_acre: 100.0
           }
         },
         headers: headers,
         as: :json
    assert_api_success(:created)

    post "/api/v1/farms/#{farm_id}/scenarios",
         params: {
           scenario: {
             name: "Base Case",
             commodity_price: 4.33,
             yield_assumption: 176,
             downside_commodity_price: 3.80,
             downside_yield: 160
           }
         },
         headers: headers,
         as: :json
    assert_api_success(:created)
    scenario_id = api_data["id"]

    post "/api/v1/farms/#{farm_id}/scenarios/#{scenario_id}/calculate",
         headers: headers,
         as: :json
    assert_api_success
    assert api_data["results"]["base_case"]["margin_per_acre"].present?
    assert api_data["results"]["by_field"].is_a?(Array)

    get "/api/v1/farms/#{farm_id}/summary",
        params: { scenario_id: scenario_id },
        headers: headers
    assert_api_success
    assert api_data["mapped_acres"].present?
    assert api_data["fields"].first["operating_cost_per_acre"].present?
    assert api_data["scenario_snapshot"]["base_case"].present?
  end

  test "analyst report enqueues and completes" do
    auth = register_user!
    headers = api_headers(auth[:token])

    post "/api/v1/farms",
         params: {
           farm: {
             name: "Report Farm",
             total_acres: 80,
             county: "Scott",
             region: "central",
             primary_commodity: "corn"
           }
         },
         headers: headers,
         as: :json
    farm_id = api_data["id"]

    post "/api/v1/farms/#{farm_id}/scenarios",
         params: {
           scenario: {
             name: "Report Scenario",
             commodity_price: 4.33,
             yield_assumption: 176
           }
         },
         headers: headers,
         as: :json
    scenario_id = api_data["id"]

    stub_payload = {
      summary: "Margins are tight at downside prices.",
      key_findings: ["Seed spend is above peer median."],
      recommendations: ["Review fertilizer quote before March."],
      risk_flags: ["Downside margin turns negative at $3.80 corn."],
      lender_narrative: "Farmer has modeled base and downside cases.",
      generated_at: Time.current
    }

    with_stubbed_service(AnalystReportGeneratorService, :call, stub_payload) do
      post "/api/v1/scenarios/#{scenario_id}/report", headers: headers, as: :json
      assert_response :accepted
      assert_equal "pending", api_data["status"]
      report_id = api_data["id"]
      assert report_id.present?

      perform_enqueued_jobs

      get "/api/v1/scenarios/#{scenario_id}/report", headers: headers, as: :json
      assert_api_success
      assert_equal "completed", api_data["status"]
      assert_equal stub_payload[:summary], api_data["summary"]
    end
  end
end
