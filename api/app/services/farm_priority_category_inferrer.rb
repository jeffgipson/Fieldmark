# frozen_string_literal: true

class FarmPriorityCategoryInferrer
  RULES = {
    lender_meeting: /\b(lender|bank|loan|financ|operating line|credit)\b/i,
    cash_flow: /\b(cash flow|cash-flow|pay bills|operating capital|short on cash)\b/i,
    crop_insurance: /\b(insurance|revenue protection|rp-|crop ins)\b/i,
    seed_fertility: /\b(seed|fertilizer|fertility|nitrogen|herbicide|chemical)\b/i,
    labor_equipment: /\b(labor|equipment|custom applic|spray|harvest help)\b/i,
    market_prices: /\b(price|market|sell|basis|commodity|corn price|bean price)\b/i,
    input_costs: /\b(input|march|commit|operating cost|cost per acre|margin)\b/i
  }.freeze

  def self.call(text)
    new(text).call
  end

  def initialize(text)
    @text = text.to_s
  end

  def call
    RULES.each do |category, pattern|
      return category.to_s if @text.match?(pattern)
    end
    "other"
  end
end
