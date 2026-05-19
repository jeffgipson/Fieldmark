# frozen_string_literal: true

module Api
  module V1
    class BillingController < BaseController
      include SubscriptionSerialization

      skip_before_action :authenticate_api_v1_user!, only: :stripe_webhook

      def show
        render_success(subscription_json(current_user))
      end

      def plans
        render_success(plan_catalog_json)
      end

      def checkout
        plan_key = checkout_params[:plan].presence
        if plan_key.blank?
          return render_errors(
            [{ field: "plan", message: "is required" }],
            status: :unprocessable_entity
          )
        end

        unless AppConfig.billing_mock?
          return render_errors(
            [{ field: "billing", message: "Checkout is not available." }],
            status: :service_unavailable
          )
        end

        session = Billing::MockStripeService.create_checkout_session(current_user, plan_key: plan_key)
        render_success(subscription_json(current_user.reload).merge(checkout: session))
      rescue Billing::MockStripeService::InvalidPlanError => e
        render_errors([{ field: "plan", message: e.message }], status: :unprocessable_entity)
      end

      def portal
        unless AppConfig.billing_mock?
          return render_errors(
            [{ field: "billing", message: "Billing portal is not available." }],
            status: :service_unavailable
          )
        end

        portal = Billing::MockStripeService.create_portal_session(current_user)
        render_success(portal)
      end

      def stripe_webhook
        unless AppConfig.billing_mock?
          return render_errors(
            [{ field: "billing", message: "Webhook endpoint disabled." }],
            status: :not_found
          )
        end

        event = webhook_params[:event].to_s
        plan_key = webhook_params[:plan].presence
        user = User.find_by(stripe_customer_id: webhook_params[:customer_id]) if webhook_params[:customer_id].present?

        case event
        when "checkout.completed"
          if user.blank? || plan_key.blank?
            return render_errors(
              [{ field: "webhook", message: "customer_id and plan are required for checkout.completed" }],
              status: :unprocessable_entity
            )
          end

          Billing::MockStripeService.create_checkout_session(user, plan_key: plan_key)
        else
          return render_errors(
            [{ field: "event", message: "Unsupported event type." }],
            status: :unprocessable_entity
          )
        end

        render_success({ received: true, subscription: subscription_json(user.reload) })
      rescue Billing::MockStripeService::InvalidPlanError => e
        render_errors([{ field: "plan", message: e.message }], status: :unprocessable_entity)
      end

      private

      def checkout_params
        params.permit(:plan)
      end

      def webhook_params
        params.permit(:event, :plan, :customer_id)
      end
    end
  end
end
