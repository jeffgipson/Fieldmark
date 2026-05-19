# frozen_string_literal: true

require "test_helper"

class FieldTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert north_80.valid?, north_80.errors.full_messages.join(", ")
  end
end
