# frozen_string_literal: true

class SubscriptionPlan
  PLANS = {
    basic: {
      key: :basic,
      name: "Basic",
      price_cents: 3000,
      max_farms: 1,
      max_fields_per_farm: 5
    },
    pro: {
      key: :pro,
      name: "Pro",
      price_cents: 5000,
      max_farms: nil,
      max_fields_per_farm: nil
    }
  }.freeze

  class << self
    def for(plan_key)
      PLANS.fetch(plan_key.to_sym)
    end

    def all
      PLANS.values
    end

    def valid_key?(plan_key)
      PLANS.key?(plan_key.to_sym)
    end
  end
end
