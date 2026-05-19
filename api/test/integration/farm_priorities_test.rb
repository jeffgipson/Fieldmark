# frozen_string_literal: true

require "test_helper"

class FarmPrioritiesTest < ActionDispatch::IntegrationTest
  test "sync and list priorities for a farm" do
    user = User.create!(
      email: "priorities-#{SecureRandom.hex(4)}@fieldmark.test",
      password: "password123",
      password_confirmation: "password123",
      first_name: "Pat",
      last_name: "Farmer"
    )
    farm = user.farms.create!(
      name: "Test Farm",
      total_acres: 500,
      county: "Cape Girardeau",
      region: :central,
      primary_commodity: :corn
    )
    headers = api_headers(jwt_for(user))

    put "/api/v1/farms/#{farm.id}/priorities/sync",
        params: {
          priorities: [
            { category: "input_costs", note: "Fertilizer quotes feel high", source: "onboarding" },
            { category: "lender_meeting", note: "Meeting in two weeks" }
          ]
        },
        headers: headers,
        as: :json
    assert_api_success
    assert_equal 2, api_data.length

    get "/api/v1/farms/#{farm.id}/priorities", headers: headers
    assert_api_success
    assert_equal 2, api_data.count { |p| p["status"] == "active" }
  end

  private

  def jwt_for(user)
    Warden::JWTAuth::UserEncoder.new.call(user, :api_v1_user, nil).first
  end
end
