# frozen_string_literal: true

Rails.application.configure do
  config.action_mailer.default_options = { from: AppConfig.mailer_from }
  config.action_mailer.perform_deliveries = AppConfig.mailer_deliver?

  if AppConfig.mailer_deliver? && AppConfig.smtp_settings.present?
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = AppConfig.smtp_settings
  end

  frontend = URI.parse(AppConfig.frontend_url)
  config.action_mailer.default_url_options = {
    host: frontend.host,
    port: frontend.port,
    protocol: frontend.scheme
  }.compact
rescue URI::InvalidURIError
  config.action_mailer.default_url_options = { host: "localhost", port: 5173 }
end
