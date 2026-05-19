# frozen_string_literal: true

require "test_helper"

class EmailsTest < ActionDispatch::IntegrationTest
  include ApiTestHelpers

  fixtures :users, :farms, :scenarios, :analyst_reports

  FARM_PARAMS = {
    name: "Email Test Farm",
    total_acres: 500,
    county: "Cape Girardeau",
    region: "central",
    primary_commodity: "corn"
  }.freeze

  setup do
    ActionMailer::Base.deliveries.clear
  end

  test "password reset request sends email for existing user" do
    user = users(:one)

    assert_emails 1 do
      post "/api/v1/auth/password",
           params: { user: { email: user.email } },
           as: :json
    end

    assert_response :no_content
    assert_includes ActionMailer::Base.deliveries.last.html_part.body.decoded, "reset-password?token="
  end

  test "password reset request does not reveal missing users" do
    assert_no_emails do
      post "/api/v1/auth/password",
           params: { user: { email: "nobody@fieldmark.test" } },
           as: :json
    end

    assert_response :no_content
  end

  test "password reset update changes password" do
    user = users(:one)
    raw_token = user.send(:set_reset_password_token)

    put "/api/v1/auth/password",
        params: {
          user: {
            reset_password_token: raw_token,
            password: "newpass456",
            password_confirmation: "newpass456"
          }
        },
        as: :json

    assert_api_success
    user.reload
    assert user.valid_password?("newpass456")
  end

  test "invitation create enqueues invitation email" do
    auth = register_user!
    headers = api_headers(auth[:token])

    assert_enqueued_emails 1 do
      post "/api/v1/invitations",
           params: { invitation: { email: "friend@fieldmark.test", message: "Join me" } },
           headers: headers,
           as: :json
    end

    assert_api_success(:created)
    assert_equal true, api_data["email_sent"]
  end

  test "report email requires completed report" do
    auth = register_user!
    headers = api_headers(auth[:token])
    farm = create_farm_for_user!(auth, headers)
    scenario = create_scenario_for_farm!(farm, headers)

    post "/api/v1/scenarios/#{scenario['id']}/report/email", headers: headers, as: :json
    assert_response :unprocessable_entity

    report = analyst_reports(:henderson_report)
    report.update!(scenario_id: scenario["id"], status: :completed, summary: "Done", generated_at: Time.current)

    assert_enqueued_emails 1 do
      post "/api/v1/scenarios/#{scenario['id']}/report/email", headers: headers, as: :json
    end
    assert_api_success
  end

  private

  def create_farm_for_user!(_auth, headers)
    post "/api/v1/farms", params: { farm: FARM_PARAMS }, headers: headers, as: :json
    assert_api_success(:created)
    api_data
  end

  def create_scenario_for_farm!(farm, headers)
    post "/api/v1/farms/#{farm['id']}/scenarios",
         params: {
           scenario: {
             name: "Base Case",
             commodity_price: 4.5,
             yield_assumption: 180,
             downside_commodity_price: 4.0,
             downside_yield: 165
           }
         },
         headers: headers,
         as: :json
    assert_api_success(:created)
    api_data
  end
end
