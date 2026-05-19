# frozen_string_literal: true

require "test_helper"

class InputCostTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert seed.valid?, seed.errors.full_messages.join(", ")
  end
end
