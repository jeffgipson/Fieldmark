# frozen_string_literal: true

module RescuesAi
  extend ActiveSupport::Concern

  included do
    rescue_from Ai::ConfigurationError, with: :render_ai_configuration_error
    rescue_from Ai::ApiError, with: :render_ai_api_error
    rescue_from AnalystService::AnalystServiceError, with: :render_analyst_service_error
  end

  private

  def render_ai_configuration_error(exception)
    render_errors([{ field: "anthropic", message: exception.message }], status: :service_unavailable)
  end

  def render_ai_api_error(_exception)
    render_errors(
      [{ field: "anthropic", message: ai_failure_message }],
      status: :bad_gateway
    )
  end

  def render_analyst_service_error(exception)
    render_errors(
      [{ field: "analyst", message: exception.message }],
      status: :bad_gateway
    )
  end

  def ai_failure_message
    AnalystService::AnalystServiceError::FRIENDLY_MESSAGE
  end
end
