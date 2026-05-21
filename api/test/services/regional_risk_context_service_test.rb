# frozen_string_literal: true

require "test_helper"

class RegionalRiskContextServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms

  setup do
    Rails.cache.clear
  end

  test "returns static payload when perplexity key is absent" do
    farm = farms(:henderson)
    without_perplexity_key do
      result = RegionalRiskContextService.call(farm)
      assert_not result[:live]
      assert result[:message].present?
      assert_equal [], result[:citations]
    end
  end

  test "delegates to market intelligence when key is present" do
    farm = farms(:henderson)
    live_payload = {
      region: "central",
      message: "Live brief from USDA.",
      source: "USDA",
      source_url: "https://www.nass.usda.gov/",
      live: true,
      researched_at: Time.current.iso8601,
      citations: [{ title: "USDA", url: "https://www.nass.usda.gov/" }],
      note: MarketIntelligenceService::LIVE_NOTE
    }

    with_perplexity_key do
      with_stubbed_service(MarketIntelligenceService, :call, live_payload) do
        result = RegionalRiskContextService.call(farm)
        assert result[:live]
        assert_equal "Live brief from USDA.", result[:message]
      end
    end
  end

  test "falls back to static when market intelligence raises" do
    farm = farms(:henderson)

    with_perplexity_key do
      original = MarketIntelligenceService.method(:call)
      MarketIntelligenceService.define_singleton_method(:call) { |_farm| raise PerplexityRouter::ApiError }
      result = RegionalRiskContextService.call(farm)
      assert_not result[:live]
      assert_equal "unavailable", result[:fallback_reason]
      assert result[:message].present?
    ensure
      MarketIntelligenceService.define_singleton_method(:call, original)
    end
  end

  private

  def with_perplexity_key
    original = ENV["PERPLEXITY_API_KEY"]
    ENV["PERPLEXITY_API_KEY"] = "test-key"
    yield
  ensure
    ENV["PERPLEXITY_API_KEY"] = original
  end

  def without_perplexity_key
    original = ENV["PERPLEXITY_API_KEY"]
    ENV.delete("PERPLEXITY_API_KEY")
    yield
  ensure
    ENV["PERPLEXITY_API_KEY"] = original
  end
end
