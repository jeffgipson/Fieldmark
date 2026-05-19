# frozen_string_literal: true

require "test_helper"

class ForecastApiTest < ActionDispatch::IntegrationTest
  fixtures :users, :farms, :fields, :input_costs, :scenarios, :benchmark_regions

  test "season snapshots crud and forecast endpoint" do
    token = login_user!(email: "farmer_one@fieldmark.test")
    headers = api_headers(token)
    farm = farms(:henderson)
    scenario = scenarios(:base_case)

    post "/api/v1/farms/#{farm.id}/season_snapshots",
         params: {
           farm_season_snapshot: {
             season_year: CurrentSeason.year - 1,
             actual_yield: 170,
             actual_price: 4.25,
             actual_total_operating_per_acre: 410,
             notes: "Good year"
           }
         },
         headers: headers,
         as: :json
    assert_api_success(:created)

    get "/api/v1/farms/#{farm.id}/scenarios/#{scenario.id}/forecast", headers: headers
    assert_api_success
    assert_equal 3, api_data["years"].size
    assert api_data["years"].first["margins"]["base"].present?
  end
end
