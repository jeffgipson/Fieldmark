# frozen_string_literal: true

require "test_helper"

class FieldmarkMailerTest < ActionMailer::TestCase
  fixtures :users, :user_invitations, :scenarios, :analyst_reports, :farms

  setup do
    @user = users(:one)
    @invitation = user_invitations(:pending_invite)
    @scenario = scenarios(:base_case)
    @report = analyst_reports(:henderson_report)
  end

  test "invitation email includes invite url and inviter" do
    email = FieldmarkMailer.invitation(@invitation)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [@invitation.email], email.to
    assert_includes email.subject, @invitation.inviter.display_name
    assert_includes email.html_part.body.decoded, @invitation.invite_url
  end

  test "welcome email includes dashboard link" do
    email = FieldmarkMailer.welcome(@user)
    email.deliver_now

    assert_includes email.html_part.body.decoded, "#{AppConfig.frontend_url.chomp('/')}/dashboard"
  end

  test "report_copy includes summary and findings" do
    email = FieldmarkMailer.report_copy(@user, @report)
    email.deliver_now

    assert_includes email.html_part.body.decoded, @report.summary
    assert_includes email.html_part.body.decoded, @scenario.farm.name
  end

  test "report_ready includes report url" do
    email = FieldmarkMailer.report_ready(@user, @report)
    email.deliver_now

    url = "#{AppConfig.frontend_url.chomp('/')}/scenarios/#{@scenario.id}/report"
    assert_includes email.html_part.body.decoded, url
  end
end
