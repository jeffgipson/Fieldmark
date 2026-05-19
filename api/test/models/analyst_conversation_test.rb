# frozen_string_literal: true

require "test_helper"

class AnalystConversationTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert henderson_chat.valid?, henderson_chat.errors.full_messages.join(", ")
  end
end
