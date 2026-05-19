# frozen_string_literal: true

class UserMailer < Devise::Mailer
  include FieldmarkMailerLayout
  helper :application

  def reset_password_instructions(record, token, _opts = {})
    reset_url = "#{AppConfig.frontend_url.chomp('/')}/reset-password?token=#{token}"

    mail_with_brand(
      to: record.email,
      subject: I18n.t("emails.password_reset.subject"),
      preheader: I18n.t("emails.password_reset.preheader"),
      headline: I18n.t("emails.password_reset.headline"),
      paragraphs: [
        I18n.t("emails.password_reset.intro", first_name: record.first_name),
        I18n.t("emails.password_reset.footer")
      ],
      cta: {
        label: I18n.t("emails.password_reset.cta"),
        url: reset_url
      }
    )
  end
end
