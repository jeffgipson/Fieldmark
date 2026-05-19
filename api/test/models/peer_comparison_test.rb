# frozen_string_literal: true

require "test_helper"

class PeerComparisonTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert henderson_base.valid?, henderson_base.errors.full_messages.join(", ")
  end
end
