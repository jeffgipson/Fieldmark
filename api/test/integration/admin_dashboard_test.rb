# frozen_string_literal: true

require "test_helper"

class AdminDashboardTest < ActionDispatch::IntegrationTest
  fixtures :users

  setup do
    @admin_token = login_user!(email: "admin@fieldmark.app")
  end

  test "admin stats returns full dashboard payload" do
    get "/api/v1/admin/stats", headers: api_headers(@admin_token)

    assert_api_success
    data = json_body["data"]
    assert data["counts"].key?("farmers")
    assert data["signups_by_month"].length == 12
    assert data["payments"]["summary"].key?("mrr_cents")
    assert data["recent_users"].is_a?(Array)
  end
end
