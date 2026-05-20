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
    assert data["connections"].key?("perplexity")

    perplexity = data["integrations"].find { |i| i["slug"] == "perplexity" }
    assert_equal "active", perplexity["status"]
    assert_equal "ai", perplexity["category"]
    assert [true, false].include?(perplexity["connected"])

    mu = data["integrations"].find { |i| i["slug"] == "mu_extension" }
    assert_equal "active", mu["status"]
    assert_nil mu["connected"]

    stripe = data["integrations"].find { |i| i["slug"] == "stripe" }
    assert_equal "in_progress", stripe["status"]
    assert_equal true, stripe["connected"]
    assert_equal true, data["connections"]["stripe"]
    assert_equal "stripe.com", stripe["logo_domain"]
    assert_equal "https://logos.hunter.io/stripe.com", stripe["logo_url"]

    macro = data["integrations"].find { |i| i["slug"] == "macro_drivers" }
    assert_nil macro["logo_url"]

    fieldmark_api = data["integrations"].find { |i| i["slug"] == "fieldmark_api" }
    assert_nil fieldmark_api["logo_url"]

    sendgrid = data["integrations"].find { |i| i["slug"] == "sendgrid" }
    assert_equal "active", sendgrid["status"]
    assert_equal true, sendgrid["connected"]

    hunter = data["integrations"].find { |i| i["slug"] == "hunter" }
    assert_equal "active", hunter["status"]
    assert_equal "hunter.io", hunter["logo_domain"]
    assert_equal "https://logos.hunter.io/hunter.io", hunter["logo_url"]
  end

  test "GET integrations requires authentication" do
    get "/api/v1/integrations", as: :json
    assert_response :unauthorized
  end
end
