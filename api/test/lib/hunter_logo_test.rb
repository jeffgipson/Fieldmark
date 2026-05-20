# frozen_string_literal: true

require "test_helper"

class HunterLogoTest < ActiveSupport::TestCase
  test "domain_from_url strips www and returns host" do
    assert_equal "stripe.com", HunterLogo.domain_from_url("https://www.stripe.com/docs")
  end

  test "url_for_website builds hunter logo url" do
    assert_equal "https://logos.hunter.io/farmcreditsemo.com",
                 HunterLogo.url_for_website("https://farmcreditsemo.com")
  end

  test "payload_for_website returns nil fields when website blank" do
    assert_equal({ logo_domain: nil, logo_url: nil }, HunterLogo.payload_for_website(nil))
  end
end
