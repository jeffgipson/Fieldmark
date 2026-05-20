# frozen_string_literal: true

require "net/http"
require "json"

# Low-level Perplexity Sonar gateway. Feature code should use MarketIntelligenceService.
class PerplexityRouter
  API_URL = "https://api.perplexity.ai/chat/completions"
  OPEN_TIMEOUT = 5
  READ_TIMEOUT = 15

  class ConfigurationError < StandardError; end

  class ApiError < StandardError
    attr_reader :cause

    def initialize(message = "Perplexity request failed.", cause: nil)
      super(message)
      @cause = cause
    end
  end

  def self.complete(messages:, model: AppConfig.perplexity_model, max_tokens: 400, temperature: 0.2,
                    search_domain_filter: nil, search_recency_filter: nil)
    new.complete(
      messages: messages,
      model: model,
      max_tokens: max_tokens,
      temperature: temperature,
      search_domain_filter: search_domain_filter,
      search_recency_filter: search_recency_filter
    )
  end

  def complete(messages:, model:, max_tokens:, temperature:, search_domain_filter:, search_recency_filter:)
    api_key = AppConfig.perplexity_api_key
    raise ConfigurationError, "PERPLEXITY_API_KEY is not configured." if api_key.blank?

    body = {
      model: model,
      messages: messages,
      max_tokens: max_tokens,
      temperature: temperature
    }
    body[:search_domain_filter] = search_domain_filter if search_domain_filter.present?
    body[:search_recency_filter] = search_recency_filter if search_recency_filter.present?

    uri = URI(API_URL)
    response = Net::HTTP.start(uri.host, uri.port, use_ssl: true,
                                 open_timeout: OPEN_TIMEOUT, read_timeout: READ_TIMEOUT) do |http|
      request = Net::HTTP::Post.new(uri)
      request["Authorization"] = "Bearer #{api_key}"
      request["Content-Type"] = "application/json"
      request.body = body.to_json
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("[PerplexityRouter] HTTP #{response.code}: #{response.body.to_s.truncate(500)}")
      raise ApiError.new
    end

    parse_response(JSON.parse(response.body))
  rescue JSON::ParserError => e
    Rails.logger.error("[PerplexityRouter] invalid JSON: #{e.message}")
    raise ApiError.new(cause: e)
  rescue Net::OpenTimeout, Net::ReadTimeout, SocketError, Errno::ECONNREFUSED => e
    Rails.logger.error("[PerplexityRouter] #{e.class}: #{e.message}")
    raise ApiError.new(cause: e)
  end

  def self.parse_response(data)
    content = data.dig("choices", 0, "message", "content").to_s.strip
    citations = Array(data["citations"]).map(&:to_s)
    search_results = Array(data["search_results"]).map do |row|
      next unless row.is_a?(Hash)

      { title: row["title"].to_s.presence, url: row["url"].to_s.presence }.compact
    end.compact

    { content: content, citations: citations, search_results: search_results }
  end

  private

  def parse_response(data)
    self.class.parse_response(data)
  end
end
