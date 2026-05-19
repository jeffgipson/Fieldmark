# frozen_string_literal: true

module FieldmarkMailerLayout
  extend ActiveSupport::Concern

  included do
    layout "fieldmark_mailer"
    default from: -> { AppConfig.mailer_from }
  end

  private

  def mail_with_brand(to:, subject:, headline:, paragraphs:, preheader: nil, cta: nil, list_heading: nil, list_items: nil)
    @preheader = preheader
    @headline = headline
    @paragraphs = Array(paragraphs).compact
    @cta = cta
    @list_heading = list_heading
    @list_items = Array(list_items).compact.presence

    mail(to: to, subject: subject) do |format|
      format.html { render "fieldmark_mailer/body" }
      format.text { render "fieldmark_mailer/body" }
    end
  end
end
