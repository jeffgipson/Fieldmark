# frozen_string_literal: true

require "test_helper"

class FarmTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert henderson.valid?, henderson.errors.full_messages.join(", ")
  end
end
