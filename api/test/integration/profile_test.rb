# frozen_string_literal: true

require "test_helper"

class ProfileTest < ActionDispatch::IntegrationTest
  test "profile show and update" do
    auth = register_user!
    headers = api_headers(auth[:token])

    get "/api/v1/profile", headers: headers
    assert_api_success
    assert_equal auth[:email], api_data["email"]

    patch "/api/v1/profile",
          params: {
            user: {
              first_name: "Pat",
              last_name: "Farmer",
              bio: "Corn and beans in Cape.",
              phone: "573-555-0100",
              social_links: { website: "https://example.com" }
            }
          },
          headers: headers,
          as: :json
    assert_api_success
    assert_equal "Pat", api_data["first_name"]
    assert_equal "Corn and beans in Cape.", api_data["bio"]
  end

  test "credentials update requires current password" do
    auth = register_user!
    headers = api_headers(auth[:token])

    patch "/api/v1/profile/credentials",
          params: {
            user: {
              current_password: "wrong",
              password: "newpass123",
              password_confirmation: "newpass123"
            }
          },
          headers: headers,
          as: :json
    assert_response :unprocessable_entity
    assert api_errors.any? { |e| e["field"] == "current_password" }
  end

  test "create and revoke invitation" do
    auth = register_user!
    headers = api_headers(auth[:token])

    post "/api/v1/invitations",
         params: { invitation: { email: "friend@fieldmark.test", message: "Join me" } },
         headers: headers,
         as: :json
    assert_api_success(:created)
    assert_includes api_data["invite_url"], "invite="
    invitation_id = api_data["id"]

    get "/api/v1/invitations", headers: headers
    assert_api_success
    assert_equal 1, api_data.length

    delete "/api/v1/invitations/#{invitation_id}", headers: headers
    assert_api_success
    assert_equal "revoked", api_data["status"]
  end
end
