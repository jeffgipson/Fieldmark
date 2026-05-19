# frozen_string_literal: true

module SubscriptionSerialization
  extend ActiveSupport::Concern

  private

  def subscription_json(user)
    config = user.plan_config
    {
      plan: user.subscription_plan,
      plan_name: config[:name],
      price_cents: config[:price_cents],
      status: user.subscription_status,
      current_period_end: user.subscription_current_period_end,
      usage: user.subscription_usage,
      limits: user.subscription_limits,
      mock: AppConfig.billing_mock?
    }
  end

  def plan_catalog_json
    SubscriptionPlan.all.map do |plan|
      {
        key: plan[:key].to_s,
        name: plan[:name],
        price_cents: plan[:price_cents],
        max_farms: plan[:max_farms],
        max_fields_per_farm: plan[:max_fields_per_farm]
      }
    end
  end
end
