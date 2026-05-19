# frozen_string_literal: true

require "test_helper"

class AnalystReportTest < ActiveSupport::TestCase
  test "fixture loads" do
    assert henderson_report.valid?, henderson_report.errors.full_messages.join(", ")
  end
end
