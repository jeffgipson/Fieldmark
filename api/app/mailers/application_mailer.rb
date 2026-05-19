class ApplicationMailer < ActionMailer::Base
  default from: -> { AppConfig.mailer_from }
end
