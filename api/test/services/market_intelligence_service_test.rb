# frozen_string_literal: true

require "test_helper"

class MarketIntelligenceServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms

  setup do
    Rails.cache.clear
  end

  test "returns live brief with citations from PerplexityRouter" do
    farm = farms(:henderson)
    stub_response = {
      content: "Central Missouri soil moisture is mixed heading into spring planting.",
      citations: ["https://www.nass.usda.gov/Statistics_by_State/Missouri/Publications/Crop_Progress/"],
      search_results: [
        { title: "Missouri Crop Progress", url: "https://www.nass.usda.gov/Statistics_by_State/Missouri/Publications/Crop_Progress/" }
      ]
    }

    with_stubbed_service(PerplexityRouter, :complete, stub_response) do
      result = MarketIntelligenceService.call(farm)
      assert result[:live]
      assert result[:message].include?("soil moisture")
      assert result[:citations].any? { |c| c[:url].present? }
      assert result[:researched_at].present?
    end
  end

  test "caches by region commodity and date" do
    farm = farms(:henderson)
    calls = 0
    stub_response = { content: "Brief.", citations: [], search_results: [] }
    original_complete = PerplexityRouter.method(:complete)
    PerplexityRouter.define_singleton_method(:complete) do |**_kwargs|
      calls += 1
      stub_response
    end

    memory_cache = ActiveSupport::Cache::MemoryStore.new
    original_cache = Rails.cache
    Rails.cache = memory_cache
    MarketIntelligenceService.call(farm)
    MarketIntelligenceService.call(farm)
    assert_equal 1, calls
  ensure
    PerplexityRouter.define_singleton_method(:complete, original_complete)
    Rails.cache = original_cache
  end

  test "passes search domain filter to PerplexityRouter" do
    farm = farms(:henderson)
    captured = nil
    stub_response = { content: "Brief.", citations: [], search_results: [] }
    original = PerplexityRouter.method(:complete)
    PerplexityRouter.define_singleton_method(:complete) do |**kwargs|
      captured = kwargs
      stub_response
    end

    MarketIntelligenceService.call(farm)
    assert_equal MarketIntelligenceService::SEARCH_DOMAINS, captured[:search_domain_filter]
    assert_equal "month", captured[:search_recency_filter]
  ensure
    PerplexityRouter.define_singleton_method(:complete, original)
  end
end
