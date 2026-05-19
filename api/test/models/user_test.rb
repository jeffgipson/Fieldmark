# frozen_string_literal: true

require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert one.valid?, one.errors.full_messages.join(", ")
  end
end
