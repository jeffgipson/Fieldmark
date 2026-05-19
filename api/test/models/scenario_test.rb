# frozen_string_literal: true

require "test_helper"

class ScenarioTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert base_case.valid?, base_case.errors.full_messages.join(", ")
  end
end
