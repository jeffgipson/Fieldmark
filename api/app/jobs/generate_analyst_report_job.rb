# frozen_string_literal: true

class GenerateAnalystReportJob < ApplicationJob
  queue_as :default

  discard_on Ai::ConfigurationError

  def perform(analyst_report_id)
    report = AnalystReport.find(analyst_report_id)
    report.update!(status: :processing, error_message: nil)

    payload = AnalystReportGeneratorService.call(report.scenario)
    report.assign_attributes(payload.merge(status: :completed, error_message: nil))
    report.save!
    notify_report_ready!(report)
  rescue Ai::ApiError
    mark_failed(report, AnalystService::AnalystServiceError::FRIENDLY_MESSAGE)
  rescue StandardError => e
    mark_failed(report, AnalystService::AnalystServiceError::FRIENDLY_MESSAGE)
    Rails.logger.error("[GenerateAnalystReportJob] #{e.class}: #{e.message}")
    raise
  end

  private

  def mark_failed(report, message)
    return unless report

    report.update!(status: :failed, error_message: message)
  end

  def notify_report_ready!(report)
    user = report.scenario.farm.user
    FieldmarkMailer.report_ready(user, report).deliver_later
  end
end
