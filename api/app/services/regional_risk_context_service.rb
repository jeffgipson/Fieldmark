# frozen_string_literal: true

class RegionalRiskContextService
  # Static fallback when Perplexity is unavailable or PERPLEXITY_API_KEY is unset.
  FLAGS = {
    "northern" => {
      message: "Northern Missouri entered spring with mixed soil moisture — review downside yield if planting into dry topsoil.",
      source: "USDA Missouri Crop Progress",
      source_url: "https://www.nass.usda.gov/Statistics_by_State/Missouri/Publications/Crop_Progress/"
    },
    "central" => {
      message: "Central Missouri conditions are near normal for late winter — still worth stress-testing yield below your five-year average.",
      source: "USDA Missouri Crop Progress",
      source_url: "https://www.nass.usda.gov/Statistics_by_State/Missouri/Publications/Crop_Progress/"
    },
    "southwest" => {
      message: "Southwest Missouri has seen more drought stress in recent seasons — benchmarks assume average weather, not a dry year.",
      source: "USDA U.S. Drought Monitor",
      source_url: "https://droughtmonitor.unl.edu/"
    }
  }.freeze

  STATIC_NOTE = "Regional risk context only — does not change your scenario automatically. " \
                "Adjust downside yield if this applies to your fields."

  def self.call(farm)
    new(farm).call
  end

  def initialize(farm)
    @farm = farm
  end

  def call
    if perplexity_enabled?
      return MarketIntelligenceService.call(@farm)
    end

    static_payload
  rescue MarketIntelligenceService::ApiError, MarketIntelligenceService::ConfigurationError,
         PerplexityRouter::ApiError, PerplexityRouter::ConfigurationError => e
    Rails.logger.warn("[RegionalRiskContextService] live research unavailable: #{e.class}")
    static_payload.merge(fallback_reason: "unavailable")
  end

  private

  def perplexity_enabled?
    return false unless AppConfig.respond_to?(:perplexity_api_key)

    AppConfig.perplexity_api_key.present?
  end

  def static_payload
    region = @farm.region.to_s
    flag = FLAGS[region] || FLAGS["central"]

    {
      region: region,
      message: flag[:message],
      source: flag[:source],
      source_url: flag[:source_url],
      live: false,
      citations: [],
      note: STATIC_NOTE
    }
  end
end
