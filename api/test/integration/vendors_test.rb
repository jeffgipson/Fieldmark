# frozen_string_literal: true

require "test_helper"

class VendorsTest < ActionDispatch::IntegrationTest
  test "GET vendors includes hunter logo fields when website present" do
    Vendor.create!(
      name: "Logo Test Co-op",
      slug: "logo-test-coop",
      category: :farm_store_coop,
      state: "MO",
      counties: ["Cape Girardeau"],
      website: "https://farmcreditsemo.com",
      active: true
    )

    auth = register_user!
    get "/api/v1/vendors", headers: api_headers(auth[:token]), as: :json
    assert_api_success(:ok)

    vendor = api_data.find { |v| v["slug"] == "logo-test-coop" }
    assert_equal "farmcreditsemo.com", vendor["logo_domain"]
    assert_equal "https://logos.hunter.io/farmcreditsemo.com", vendor["logo_url"]
  end
end
