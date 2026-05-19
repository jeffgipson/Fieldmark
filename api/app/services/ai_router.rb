# frozen_string_literal: true

# Low-level Claude gateway. Feature code should use `Ai.ask` / `Ai.chat` instead.
# Never instantiate Anthropic::Client outside this class.
class AiRouter
  class ConfigurationError < StandardError; end

  class ApiError < StandardError
    attr_reader :cause

    def initialize(message = "Claude request failed.", cause: nil)
      super(message)
      @cause = cause
    end
  end

  # Latest stable Claude Sonnet (GA). Bump when Anthropic releases a new Sonnet GA model.
  SONNET_STABLE_MODEL = "claude-sonnet-4-6"
  DEFAULT_MAX_TOKENS = 2048

  def self.default_model
    AppConfig.anthropic_model
  end

  def self.complete(system:, messages:, max_tokens: DEFAULT_MAX_TOKENS, model: default_model)
    new.complete(system:, messages:, max_tokens:, model:)
  end

  def complete(system:, messages:, max_tokens:, model:)
    response = self.class.client.messages.create(
      model: model,
      max_tokens: max_tokens,
      system: system,
      messages: messages
    )

    self.class.extract_text(response)
  rescue Anthropic::Errors::APIError => e
    Rails.logger.error("[AiRouter] #{e.class}: #{e.message}")
    raise ApiError.new(cause: e)
  end

  def self.client
    api_key = AppConfig.anthropic_api_key
    if api_key.blank?
      raise ConfigurationError, "ANTHROPIC_API_KEY is not configured."
    end

    @client ||= Anthropic::Client.new(api_key: api_key)
  end

  def self.extract_text(response)
    response.content.filter_map do |block|
      block.text if block.respond_to?(:text)
    end.join("\n").presence || "I could not generate a response."
  end
end
