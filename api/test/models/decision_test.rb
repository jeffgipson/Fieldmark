# frozen_string_literal: true

require "test_helper"

class DecisionTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert henderson_decision.valid?, henderson_decision.errors.full_messages.join(", ")
  end
end
