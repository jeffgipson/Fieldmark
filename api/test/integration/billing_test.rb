# frozen_string_literal: true

require "test_helper"

class BillingTest < ActionDispatch::IntegrationTest
  include ApiTestHelpers

  FARM_PARAMS = {
    name: "Test Farm",
    total_acres: 500,
    county: "Cape Girardeau",
    region: "central",
    primary_commodity: "corn"
  }.freeze

  FIELD_PARAMS = {
    name: "North 40",
    acres: 40,
    soil_type: "Silt loam",
    primary_commodity: "corn"
  }.freeze

  def farmer_auth!
    email = "farmer-#{SecureRandom.hex(4)}@fieldmark.test"
    password = "password123"
    User.create!(
      email: email,
      password: password,
      password_confirmation: password,
      first_name: "Test",
      last_name: "Farmer"
    )
    token = login_user!(email: email, password: password)
    { email: email, password: password, token: token }
  end

  test "GET billing returns basic plan limits" do
    auth = farmer_auth!
    get "/api/v1/billing", headers: api_headers(auth[:token])

    assert_api_success
    assert_equal "basic", api_data["plan"]
    assert_equal 1, api_data["limits"]["max_farms"]
    assert_equal 5, api_data["limits"]["max_fields_per_farm"]
    assert api_data["mock"]
  end

  test "basic user cannot create second farm" do
    auth = farmer_auth!
    headers = api_headers(auth[:token])

    post "/api/v1/farms", params: { farm: FARM_PARAMS }, headers: headers, as: :json
    assert_api_success(:created)

    post "/api/v1/farms", params: { farm: FARM_PARAMS.merge(name: "Second Farm") }, headers: headers, as: :json
    assert_response :payment_required
    assert_equal "subscription", api_errors.first["field"]
  end

  test "basic user cannot create sixth field" do
    auth = farmer_auth!
    headers = api_headers(auth[:token])

    post "/api/v1/farms", params: { farm: FARM_PARAMS }, headers: headers, as: :json
    assert_api_success(:created)
    farm_id = api_data["id"]

    5.times do |i|
      post "/api/v1/farms/#{farm_id}/fields",
           params: { field: FIELD_PARAMS.merge(name: "Field #{i + 1}") },
           headers: headers,
           as: :json
      assert_api_success(:created)
    end

    post "/api/v1/farms/#{farm_id}/fields",
         params: { field: FIELD_PARAMS.merge(name: "Field 6") },
         headers: headers,
         as: :json
    assert_response :payment_required
    assert_equal "subscription", api_errors.first["field"]
  end

  test "checkout upgrades to pro and allows second farm" do
    auth = farmer_auth!
    headers = api_headers(auth[:token])

    post "/api/v1/farms", params: { farm: FARM_PARAMS }, headers: headers, as: :json
    assert_api_success(:created)

    post "/api/v1/billing/checkout", params: { plan: "pro" }, headers: headers, as: :json
    assert_api_success
    assert_equal "pro", api_data["plan"]

    post "/api/v1/farms", params: { farm: FARM_PARAMS.merge(name: "Second Farm") }, headers: headers, as: :json
    assert_api_success(:created)
  end

  test "admin bypasses farm limit" do
    AdminSeed.call
    token = login_user!(email: AppConfig.admin_email, password: ENV.fetch("ADMIN_PASSWORD", "password123"))

    headers = api_headers(token)
    2.times do |i|
      post "/api/v1/farms",
           params: { farm: FARM_PARAMS.merge(name: "Admin Farm #{i + 1}") },
           headers: headers,
           as: :json
      assert_api_success(:created)
    end
  end
end
