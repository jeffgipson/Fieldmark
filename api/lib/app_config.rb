# frozen_string_literal: true

# Central ENV access. Add new keys here and in .env.example — never scatter ENV.fetch.
module AppConfig
  class << self
    def nass_api_key
      ENV.fetch("NASS_API_KEY", nil).presence
    end

    def anthropic_api_key
      ENV.fetch("ANTHROPIC_API_KEY", nil).presence
    end

    def anthropic_model
      ENV.fetch("ANTHROPIC_MODEL", AiRouter::SONNET_STABLE_MODEL)
    end

    def perplexity_api_key
      ENV.fetch("PERPLEXITY_API_KEY", nil).presence
    end

    def perplexity_model
      ENV.fetch("PERPLEXITY_MODEL", "sonar")
    end

    def jwt_secret_key
      ENV.fetch("JWT_SECRET_KEY") do
        Rails.application.credentials.dig(:devise, :jwt_secret_key) ||
          Rails.application.secret_key_base
      end
    end

    def cors_origins
      ENV.fetch(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5175,http://127.0.0.1:5175,http://localhost:5176,http://localhost:5177"
      ).split(",").map(&:strip)
    end

    def redis_url
      ENV.fetch("REDIS_URL", "redis://localhost:6379/0")
    end

    def demo_email
      ENV.fetch("DEMO_EMAIL", "demo@fieldmark.app")
    end

    def demo_password
      ENV.fetch("DEMO_PASSWORD", "FieldmarkDemo2026!")
    end

    def admin_email
      ENV.fetch("ADMIN_EMAIL", "admin@fieldmark.app")
    end

    def regrid_api_key
      ENV.fetch("REGRID_API_KEY", nil).presence
    end

    # Maps JavaScript API + Places (exposed to authenticated clients for address autocomplete).
    def google_maps_api_key
      ENV.fetch("GOOGLE_MAPS_API_KEY", nil).presence ||
        ENV.fetch("VITE_GOOGLE_MAPS_API_KEY", nil).presence
    end

    def frontend_url
      ENV.fetch("FRONTEND_URL", "http://localhost:5173")
    end

    def mailer_from
      ENV.fetch("MAILER_FROM", "Fieldmark <noreply@fieldmark.app>")
    end

    # Off by default until you opt in (SendGrid adapter TBD). Tests always deliver via :test adapter.
    def mailer_deliver?
      return true if Rails.env.test?

      return true if ENV.fetch("MAILER_DELIVER", "false").casecmp("true").zero?

      smtp_settings.present?
    end

    # Future: SendGrid HTTP API (not used until a delivery adapter is added).
    def sendgrid_api_key
      ENV.fetch("SENDGRID_API_KEY", nil).presence
    end

    def smtp_settings
      return nil if smtp_address.blank?

      {
        address: smtp_address,
        port: smtp_port,
        user_name: smtp_username,
        password: smtp_password,
        authentication: :plain,
        enable_starttls_auto: true
      }.compact
    end

    def smtp_address
      ENV.fetch("SMTP_ADDRESS", nil).presence
    end

    def smtp_port
      ENV.fetch("SMTP_PORT", "587").to_i
    end

    def smtp_username
      ENV.fetch("SMTP_USERNAME", nil).presence
    end

    def smtp_password
      ENV.fetch("SMTP_PASSWORD", nil).presence
    end

    def billing_mock?
      ENV.fetch("BILLING_MOCK", "true").casecmp("true").zero?
    end

    def stripe_secret_key
      ENV.fetch("STRIPE_SECRET_KEY", nil).presence
    end

    def stripe_webhook_secret
      ENV.fetch("STRIPE_WEBHOOK_SECRET", nil).presence
    end

    def stripe_price_basic
      ENV.fetch("STRIPE_PRICE_BASIC", nil).presence
    end

    def stripe_price_pro
      ENV.fetch("STRIPE_PRICE_PRO", nil).presence
    end
  end
end
