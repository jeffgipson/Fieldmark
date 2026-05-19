# frozen_string_literal: true

# Simple API for Claude calls. Use this in feature services — not Anthropic::Client or AiRouter.
#
#   Ai.ask("Summarize margin risk.", system: AnalystService::SYSTEM_PROMPT)
#   Ai.chat(messages: history, system: AnalystService::SYSTEM_PROMPT, max_tokens: 4096)
module Ai
  ConfigurationError = AiRouter::ConfigurationError
  ApiError = AiRouter::ApiError

  # Single user turn.
  def self.ask(prompt, system:, max_tokens: AiRouter::DEFAULT_MAX_TOKENS, model: AiRouter.default_model)
    chat(
      messages: [{ role: "user", content: prompt }],
      system: system,
      max_tokens: max_tokens,
      model: model
    )
  end

  # Multi-turn conversation (Anthropic message shape: role + content).
  def self.chat(messages:, system:, max_tokens: AiRouter::DEFAULT_MAX_TOKENS, model: AiRouter.default_model)
    AiRouter.complete(system:, messages:, max_tokens:, model:)
  end

  # Structured JSON from Claude. Pass `prompt` or `messages` (not both).
  def self.json(system:, keys:, prompt: nil, messages: nil, defaults: {}, max_tokens: 4096,
                model: AiRouter.default_model)
    raise ArgumentError, "Provide prompt or messages" if prompt.blank? && messages.blank?

    json_instruction = "Return a single JSON object only (no markdown fences) with keys: " \
                       "#{keys.map(&:to_s).join(', ')}. Use plain text strings only — no HTML."
    text = if messages.present?
             chat(
               messages: messages + [{ role: "user", content: json_instruction }],
               system: system,
               max_tokens: max_tokens,
               model: model
             )
           else
             ask("#{prompt}\n\n#{json_instruction}", system: system, max_tokens: max_tokens, model: model)
           end

    parse_json(text, keys, defaults)
  end

  def self.parse_json(text, keys, defaults = {})
    cleaned = extract_json_body(text)
    data = JSON.parse(cleaned)
    keys.index_with do |key|
      data[key.to_s].presence || defaults.fetch(key, default_for_key(key))
    end
  rescue JSON::ParserError
    keys.index_with { |key| defaults.fetch(key, default_for_key(key)) }
  end

  def self.default_for_key(key)
    key.to_s.end_with?("s") ? [] : nil
  end

  def self.extract_json_body(text)
    raw = text.to_s.strip
    fenced = raw.gsub(/\A```(?:json)?\s*|\s*```\z/i, "").strip
    return fenced if fenced.start_with?("{", "[")

    match = raw.match(/\{[\s\S]*\}/m)
    match ? match[0] : fenced
  end
  private_class_method :extract_json_body, :default_for_key
end
