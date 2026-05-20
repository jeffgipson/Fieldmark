# frozen_string_literal: true

require "test_helper"

class AdminStripeTest < ActionDispatch::IntegrationTest
  fixtures :users

  setup do
    @admin_token = login_user!(email: "admin@fieldmark.app")
    @farmer_token = login_user!(email: "farmer_one@fieldmark.test")
  end

  test "admin can load mock stripe dashboard" do
    get "/api/v1/admin/stripe", headers: api_headers(@admin_token)

    assert_api_success
    data = json_body["data"]
    assert_equal "mock", data["mode"]
    assert data["summary"].key?("mrr_cents")
    assert data["transactions"].is_a?(Array)
    assert data["transactions"].any?
    assert data["monthly_revenue"].length == 12
  end

  test "non-admin cannot load stripe dashboard" do
    get "/api/v1/admin/stripe", headers: api_headers(@farmer_token)

    assert_response :forbidden
  end
end
