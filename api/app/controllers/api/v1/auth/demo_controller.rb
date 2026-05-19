# frozen_string_literal: true

module Api
  module V1
    module Auth
      class DemoController < ApplicationController
        include JsonResponse
        include DeviseSessionless
        include SubscriptionSerialization

        def create
          user = if params[:role].to_s == "admin"
                   AdminSeed.call
                 else
                   DemoSeed.call unless User.exists?(email: AppConfig.demo_email.downcase)
                   User.find_by!(email: AppConfig.demo_email.downcase)
                 end

          sign_in(:api_v1_user, user, store: false)
          render_success(user_json(user))
        rescue StandardError => e
          Rails.logger.error("[DemoLogin] #{e.class}: #{e.message}")
          render_errors(
            [{ field: "demo", message: "Could not prepare demo account. Try again." }],
            status: :service_unavailable
          )
        end

        private

        def user_json(user)
          user.as_json(only: %i[id email first_name last_name role]).merge(
            "subscription" => subscription_json(user),
            token: request.env["warden-jwt_auth.token"]
          )
        end
      end
    end
  end
end
