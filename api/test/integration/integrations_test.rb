# frozen_string_literal: true

require "test_helper"

class IntegrationsTest < ActionDispatch::IntegrationTest
  test "GET integrations returns catalog for authenticated user" do
    auth = register_user!
    headers = api_headers(auth[:token])

    get "/api/v1/integrations", headers: headers, as: :json
    assert_api_success(:ok)

    data = api_data
    assert data["integrations"].is_a?(Array)
    assert data["integrations"].length >= 10
    assert data["categories"].is_a?(Hash)
    assert data["connections"].key?("anthropic")

    mu = data["integrations"].find { |i| i["slug"] == "mu_extension" }
    assert_equal "active", mu["status"]
    assert_nil mu["connected"]

    stripe = data["integrations"].find { |i| i["slug"] == "stripe" }
    assert_equal "in_progress", stripe["status"]
  end

  test "GET integrations requires authentication" do
    get "/api/v1/integrations", as: :json
    assert_response :unauthorized
  end
end
