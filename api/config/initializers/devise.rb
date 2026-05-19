# frozen_string_literal: true
Devise.setup do |config|
  config.mailer = "UserMailer"
  config.mailer_sender = AppConfig.mailer_from
  require 'devise/orm/active_record'
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth, :params_auth, :cookie_auth, :database_authenticatable]
  config.navigational_formats = []
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = true
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete
  config.jwt do |jwt|
    jwt.secret = AppConfig.jwt_secret_key
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/login$}],
      ['POST', %r{^/api/v1/auth/demo$}],
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/logout$}],
    ]
    jwt.request_formats = {
      user: ['json']
    }
  end
end
