# frozen_string_literal: true

require "test_helper"

class AnalystMessageTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert user_msg.valid?, user_msg.errors.full_messages.join(", ")
  end
end
