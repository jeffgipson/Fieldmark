# frozen_string_literal: true

require "test_helper"

class BenchmarkRegionTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert central_corn.valid?, central_corn.errors.full_messages.join(", ")
  end
end
