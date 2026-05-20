# frozen_string_literal: true

require "test_helper"

class FieldmarkAppGuideTest < ActiveSupport::TestCase
  test "client_location matches scenario detail path" do
    loc = FieldmarkAppGuide.client_location("/scenarios/42")

    assert_equal "/scenarios/42", loc[:path]
    assert_equal "Scenario detail", loc[:page][:label]
  end

  test "client_location is nil for blank path" do
    assert_nil FieldmarkAppGuide.client_location("")
    assert_nil FieldmarkAppGuide.client_location(nil)
  end

  test "payload includes client_location when path given" do
    guide = FieldmarkAppGuide.payload(client_path: "/farm")

    assert_equal "/farm", guide[:client_location][:path]
    assert_equal "My Farm", guide[:client_location][:page][:label]
  end
end
