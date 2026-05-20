# frozen_string_literal: true

# Live USDA / MU field-conditions research via Perplexity Sonar (retrieval only).
# Claude (Dale) interprets results from regional_risk in ContextSnapshotBuilder.
class MarketIntelligenceService
  ApiError = PerplexityRouter::ApiError
  ConfigurationError = PerplexityRouter::ConfigurationError

  SEARCH_DOMAINS = %w[
    usda.gov
    nass.usda.gov
    droughtmonitor.unl.edu
    extension.missouri.edu
  ].freeze

  CACHE_TTL = 12.hours
  LIVE_NOTE = "Live research from USDA and university sources — does not change your scenario numbers."

  REGION_LABELS = {
    "northern" => "Northern",
    "central" => "Central",
    "southwest" => "Southwest"
  }.freeze

  def self.call(farm)
    new(farm).call
  end

  def initialize(farm)
    @farm = farm
  end

  def call
    region = @farm.region.to_s.presence || "central"
    commodity = @farm.primary_commodity.to_s.presence || "corn"

    cache_key = "market_intel:v1:#{region}:#{commodity}:#{Date.current}"
    Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
      fetch_live_brief(region:, commodity:)
    end
  end

  private

  def fetch_live_brief(region:, commodity:)
    region_label = REGION_LABELS[region] || "Central"
    commodity_label = commodity.to_s.tr("_", " ")

    user_query = <<~QUERY.squish
      For #{region_label} Missouri #{commodity_label} farmers planning March input commitments:
      summarize current USDA crop progress, U.S. Drought Monitor status, and any relevant
      MU Extension notes. Plain Midwest language, 2–3 sentences max.
      No vendor or product recommendations.
    QUERY

    result = PerplexityRouter.complete(
      messages: [
        {
          role: "system",
          content: "You summarize public agricultural conditions with factual citations only."
        },
        { role: "user", content: user_query }
      ],
      search_domain_filter: SEARCH_DOMAINS,
      search_recency_filter: "month"
    )

    citations = build_citations(result)
    primary = citations.first || {}

    {
      region: region,
      message: result[:content].presence || fallback_message(region),
      source: primary[:title] || "USDA & university sources",
      source_url: primary[:url],
      live: true,
      researched_at: Time.current.iso8601,
      citations: citations,
      note: LIVE_NOTE
    }
  end

  def build_citations(result)
    from_search = Array(result[:search_results]).filter_map do |row|
      next unless row.is_a?(Hash)

      row = row.with_indifferent_access
      url = row[:url]
      next if url.blank?

      title = row[:title].presence || citation_title_from_url(url)
      { title: title, url: url }
    end

    from_urls = Array(result[:citations]).filter_map do |url|
      next if url.blank?

      { title: citation_title_from_url(url), url: url }
    end

    (from_search + from_urls).uniq { |c| c[:url] }.first(6)
  end

  def citation_title_from_url(url)
    host = URI.parse(url).host.to_s.sub(/\Awww\./, "")
    return "USDA Missouri Crop Progress" if host.include?("nass.usda.gov")
    return "U.S. Drought Monitor" if host.include?("droughtmonitor")
    return "MU Extension" if host.include?("extension.missouri.edu")

    host.presence || "Source"
  rescue URI::InvalidURIError
    "Source"
  end

  def fallback_message(region)
    RegionalRiskContextService::FLAGS[region]&.dig(:message) ||
      RegionalRiskContextService::FLAGS["central"][:message]
  end
end
