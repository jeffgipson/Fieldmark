# frozen_string_literal: true

class FieldmarkMailer < ApplicationMailer
  include FieldmarkMailerLayout

  def invitation(invitation)
    inviter = invitation.inviter
    inviter_name = inviter.display_name
    paragraphs = [
      I18n.t("emails.invitation.intro", inviter_name: inviter_name)
    ]
    if invitation.message.present?
      paragraphs << I18n.t("emails.invitation.personal_message", inviter_name: inviter_name)
      paragraphs << invitation.message
    end
    paragraphs << I18n.t(
      "emails.invitation.footer",
      expires_on: I18n.l(invitation.expires_at.to_date, format: :long),
      email: invitation.email
    )

    mail_with_brand(
      to: invitation.email,
      subject: I18n.t("emails.invitation.subject", inviter_name: inviter_name),
      preheader: I18n.t("emails.invitation.preheader"),
      headline: I18n.t("emails.invitation.headline"),
      paragraphs: paragraphs,
      cta: {
        label: I18n.t("emails.invitation.cta"),
        url: invitation.invite_url
      }
    )
  end

  def welcome(user)
    mail_with_brand(
      to: user.email,
      subject: I18n.t("emails.welcome.subject"),
      preheader: I18n.t("emails.welcome.preheader"),
      headline: I18n.t("emails.welcome.headline"),
      paragraphs: [
        I18n.t("emails.welcome.intro", first_name: user.first_name),
        I18n.t("emails.welcome.footer")
      ],
      cta: {
        label: I18n.t("emails.welcome.cta"),
        url: dashboard_url
      }
    )
  end

  def report_ready(user, report)
    scenario = report.scenario
    farm = scenario.farm

    mail_with_brand(
      to: user.email,
      subject: I18n.t("emails.report_ready.subject", farm_name: farm.name),
      preheader: I18n.t("emails.report_ready.preheader"),
      headline: I18n.t("emails.report_ready.headline"),
      paragraphs: [
        I18n.t(
          "emails.report_ready.intro",
          first_name: user.first_name,
          farm_name: farm.name,
          scenario_name: scenario.name
        ),
        I18n.t("emails.report_ready.footer")
      ],
      cta: {
        label: I18n.t("emails.report_ready.cta"),
        url: report_url_for(scenario)
      }
    )
  end

  def report_copy(user, report)
    scenario = report.scenario
    farm = scenario.farm
    findings = Array(report.key_findings).first(5)
    paragraphs = [
      I18n.t(
        "emails.report_copy.intro",
        first_name: user.first_name,
        farm_name: farm.name,
        scenario_name: scenario.name,
        generated_on: I18n.l(report.generated_at.to_date, format: :long)
      )
    ]
    paragraphs << "#{I18n.t('emails.report_copy.summary_heading')}: #{report.summary}" if report.summary.present?
    paragraphs << I18n.t("emails.report_copy.footer")

    mail_with_brand(
      to: user.email,
      subject: I18n.t("emails.report_copy.subject", farm_name: farm.name),
      preheader: I18n.t("emails.report_copy.preheader"),
      headline: I18n.t("emails.report_copy.headline"),
      paragraphs: paragraphs,
      list_heading: findings.any? ? I18n.t("emails.report_copy.findings_heading") : nil,
      list_items: findings,
      cta: {
        label: I18n.t("emails.report_copy.cta"),
        url: report_url_for(scenario)
      }
    )
  end

  private

  def dashboard_url
    "#{AppConfig.frontend_url.chomp('/')}/dashboard"
  end

  def report_url_for(scenario)
    "#{AppConfig.frontend_url.chomp('/')}/scenarios/#{scenario.id}/report"
  end
end
