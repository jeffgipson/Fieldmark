# frozen_string_literal: true

require "test_helper"

class DecisionFieldNotesTest < ActionDispatch::IntegrationTest
  fixtures :users, :farms, :fields, :scenarios, :decisions

  test "updates decision with field_notes" do
    token = login_user!(email: "farmer_one@fieldmark.test")
    headers = api_headers(token)
    scenario = scenarios(:base_case)
    field = fields(:north_80)

    patch "/api/v1/scenarios/#{scenario.id}/decision",
          params: {
            decision: {
              decision_type: "modify",
              notes: "Proceed with changes on wet ground",
              field_notes: [
                { field_id: field.id, stance: "modify", note: "Reduce seed tier on bottomland" }
              ]
            }
          },
          headers: headers,
          as: :json

    assert_api_success
    assert_equal "modify", api_data["decision_type"]
    assert_equal 1, api_data["field_notes"].size
    assert_equal field.id, api_data["field_notes"].first["field_id"]
    assert_equal "modify", api_data["field_notes"].first["stance"]
  end
end
