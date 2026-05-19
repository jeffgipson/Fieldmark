# frozen_string_literal: true

module Api
  module V1
    class Users::RegistrationsController < Devise::RegistrationsController
      include JsonResponse
      include SubscriptionSerialization

      respond_to :json

      private

      def respond_with(resource, _opts = {})
        if resource.persisted?
          accept_pending_invitation!(resource)
          render_success(
            registration_json(resource).merge(
              token: request.env["warden-jwt_auth.token"]
            ),
            status: :created
          )
        else
          render_errors(model_errors(resource), status: :unprocessable_entity)
        end
      end

      def sign_up_params
        params.require(:user).permit(
          :email, :password, :password_confirmation, :first_name, :last_name
        )
      end

      def registration_json(user)
        user.as_json(only: %i[id email first_name last_name role bio phone social_links]).merge(
          "subscription" => subscription_json(user)
        )
      end

      def accept_pending_invitation!(user)
        token = params.dig(:user, :invite_token).presence
        return if token.blank?

        invitation = UserInvitation.active.find_by(token: token)
        return if invitation.blank?
        return unless invitation.email.downcase == user.email.downcase

        invitation.accept!(user)
      rescue ActiveRecord::RecordInvalid
        nil
      end
    end
  end
end
