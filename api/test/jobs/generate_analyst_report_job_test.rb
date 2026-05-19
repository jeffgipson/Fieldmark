# frozen_string_literal: true

require "test_helper"

class GenerateAnalystReportJobTest < ActiveJob::TestCase
  include ActiveJob::TestHelper

  fixtures :users, :farms, :scenarios, :analyst_reports

  test "enqueues report ready email when generation succeeds" do
    report = analyst_reports(:henderson_report)
    report.update!(status: :pending, summary: nil, generated_at: nil)

    payload = {
      summary: "Margins look workable.",
      key_findings: ["Seed cost is in line."],
      recommendations: [],
      risk_flags: [],
      lender_narrative: "Narrative",
      generated_at: Time.current
    }

    with_stubbed_service(AnalystReportGeneratorService, :call, payload) do
      assert_enqueued_jobs 1, only: ActionMailer::MailDeliveryJob do
        GenerateAnalystReportJob.perform_now(report.id)
      end
    end

    assert_equal "completed", report.reload.status
  end
end
