# frozen_string_literal: true

require "test_helper"

class JwtDenylistTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert revoked.valid?, revoked.errors.full_messages.join(", ")
  end
end
