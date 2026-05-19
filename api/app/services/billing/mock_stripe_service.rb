# frozen_string_literal: true

module Billing
  class MockStripeService
    class InvalidPlanError < StandardError; end

    class << self
      def ensure_customer!(user)
        return user.stripe_customer_id if user.stripe_customer_id.present?

        customer_id = "cus_mock_#{SecureRandom.hex(8)}"
        user.update!(stripe_customer_id: customer_id)
        customer_id
      end

      def create_checkout_session(user, plan_key:)
        plan_key = plan_key.to_sym
        raise InvalidPlanError, "Unknown plan: #{plan_key}" unless SubscriptionPlan.valid_key?(plan_key)

        ensure_customer!(user)
        subscription_id = "sub_mock_#{SecureRandom.hex(8)}"
        user.update!(
          subscription_plan: plan_key,
          subscription_status: :active,
          stripe_subscription_id: subscription_id,
          subscription_current_period_end: 1.month.from_now
        )

        {
          session_id: "cs_mock_#{SecureRandom.hex(8)}",
          url: nil,
          completed: true
        }
      end

      def create_portal_session(user)
        ensure_customer!(user)
        { url: "#{AppConfig.frontend_url}/profile#billing" }
      end

      def cancel_subscription(user)
        ensure_customer!(user)
        user.update!(
          subscription_plan: :basic,
          subscription_status: :active,
          stripe_subscription_id: "sub_mock_#{SecureRandom.hex(8)}",
          subscription_current_period_end: 1.month.from_now
        )
        user
      end

      def process_webhook!(plan_key:)
        plan_key = plan_key.to_sym
        raise InvalidPlanError, "Unknown plan: #{plan_key}" unless SubscriptionPlan.valid_key?(plan_key)

        { plan: plan_key.to_s, processed: true }
      end
    end
  end
end
