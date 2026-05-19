# frozen_string_literal: true

module Api
  module V1
    class AnalystReportsController < BaseController
      def show
        scenario = find_scenario!
        report = scenario.analyst_report
        return render_success(nil) unless report

        render_success(report_json(report))
      end

      def email
        scenario = find_scenario!
        report = scenario.analyst_report
        unless report&.completed?
          return render_errors(
            [{ field: "base", message: "Complete your lender report before emailing it." }],
            status: :unprocessable_entity
          )
        end

        if report_email_rate_limited?
          return render_errors(
            [{ field: "base", message: "You can email this report up to 5 times per hour. Try again later." }],
            status: :too_many_requests
          )
        end

        FieldmarkMailer.report_copy(current_user, report).deliver_later
        increment_report_email_count!
        render_success(
          { message: "Report sent to #{current_user.email}", emailed_to: current_user.email }
        )
      end

      def create
        scenario = find_scenario!
        report = scenario.analyst_report || scenario.build_analyst_report

        if report.persisted? && (report.pending? || report.processing?) && !regenerate?
          return render_success(report_json(report), status: :accepted)
        end

        if report.persisted? && report.completed? && !regenerate?
          return render_success(report_json(report))
        end

        reset_report!(report) if report.persisted?
        report.assign_attributes(status: :pending, error_message: nil)
        report.save!
        GenerateAnalystReportJob.perform_later(report.id)

        render_success(report_json(report), status: :accepted)
      end

      private

      def regenerate?
        ActiveModel::Type::Boolean.new.cast(params[:regenerate])
      end

      def reset_report!(report)
        report.assign_attributes(
          summary: nil,
          key_findings: nil,
          recommendations: nil,
          risk_flags: nil,
          lender_narrative: nil,
          generated_at: nil,
          error_message: nil
        )
      end

      def report_json(report)
        report.as_json(only: %i[
          id scenario_id status error_message summary key_findings recommendations risk_flags
          lender_narrative generated_at created_at updated_at
        ])
      end

      def report_email_rate_limit_key
        "report_email:#{current_user.id}"
      end

      def report_email_rate_limited?
        Rails.cache.read(report_email_rate_limit_key).to_i >= 5
      end

      def increment_report_email_count!
        key = report_email_rate_limit_key
        count = Rails.cache.read(key).to_i + 1
        Rails.cache.write(key, count, expires_in: 1.hour)
      end
    end
  end
end
