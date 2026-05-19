# frozen_string_literal: true

class ReportContentNormalizer
  LIST_KEYS = %i[key_findings recommendations risk_flags].freeze
  TEXT_KEYS = %i[summary lender_narrative].freeze
  LIST_ITEM_KEYS = %w[finding text description detail message title body recommendation risk flag].freeze

  def self.normalize(payload)
    new(payload).normalize
  end

  def initialize(payload)
    @payload = payload.to_h.deep_symbolize_keys
  end

  def normalize
    merged = merge_embedded_json(@payload)
    {
      summary: clean_text(merged[:summary]),
      key_findings: clean_list(merged[:key_findings]),
      recommendations: clean_list(merged[:recommendations]),
      risk_flags: clean_list(merged[:risk_flags]),
      lender_narrative: clean_text(merged[:lender_narrative])
    }
  end

  private

  def merge_embedded_json(payload)
    TEXT_KEYS.each do |key|
      value = payload[key]
      next if value.blank?

      parsed = parse_json_object(value)
      next unless parsed.is_a?(Hash)

      payload = payload.merge(parsed.symbolize_keys)
      payload.delete(key) unless parsed.key?(key.to_s) || parsed.key?(key)
    end
    payload
  end

  def parse_json_object(value)
    raw = value.to_s.strip
    return nil unless raw.start_with?("{", "[")

    body = raw.gsub(/\A```(?:json)?\s*|\s*```\z/, "").strip
    JSON.parse(body)
  rescue JSON::ParserError
    match = raw.match(/\{[\s\S]*\}/m)
    return nil unless match

    JSON.parse(match[0])
  rescue JSON::ParserError
    nil
  end

  def clean_list(value)
    Array.wrap(value).filter_map { |item| clean_list_item(item) }.reject(&:blank?).uniq
  end

  def clean_list_item(item)
    case item
    when String
      clean_text(item)
    when Hash
      key = LIST_ITEM_KEYS.find { |k| item[k].present? }
      clean_text(key ? item[key] : item.values.compact.join(" — "))
    when Array
      item.filter_map { |part| clean_list_item(part) }.join(" ")
    else
      clean_text(item.to_s)
    end
  end

  def clean_text(value)
    return nil if value.blank?

    text = value.to_s
    text = text.gsub(/\A```(?:json|html)?\s*|\s*```\z/i, "").strip
    text = strip_html(text)
    text = text.gsub(/\*\*(.+?)\*\*/, '\1')
    text = text.gsub(/\*(.+?)\*/, '\1')
    text.gsub(/\s+/, " ").strip.presence
  end

  def strip_html(text)
    text
      .gsub(/<br\s*\/?>/i, "\n")
      .gsub(/<\/p>\s*<p>/i, "\n\n")
      .gsub(/<[^>]+>/, "")
      .gsub(/&nbsp;/i, " ")
      .gsub(/&amp;/, "&")
      .gsub(/&lt;/, "<")
      .gsub(/&gt;/, ">")
      .gsub(/&quot;/, '"')
  end
end
