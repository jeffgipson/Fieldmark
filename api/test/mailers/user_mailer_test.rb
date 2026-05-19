# frozen_string_literal: true

require "test_helper"

class UserMailerTest < ActionMailer::TestCase
  fixtures :users

  test "reset password instructions include frontend reset url" do
    user = users(:one)
    token = "raw-reset-token"
    email = UserMailer.reset_password_instructions(user, token)
    email.deliver_now

    expected_url = "#{AppConfig.frontend_url.chomp('/')}/reset-password?token=#{token}"
    assert_includes email.html_part.body.decoded, expected_url
    assert_equal [user.email], email.to
  end
end
