# frozen_string_literal: true

module Api
  module V1
    class Users::SessionsController < Devise::SessionsController
      include JsonResponse
      include DeviseSessionless
      include SubscriptionSerialization

      respond_to :json

      def create
        user = User.find_for_database_authentication(email: sign_in_params[:email])

        if user&.valid_password?(sign_in_params[:password])
          sign_in(:api_v1_user, user, store: false)
          render_success(user_json(user))
        else
          render_errors(
            [{ field: "credentials", message: "Invalid email or password." }],
            status: :unauthorized
          )
        end
      end

      protected

      def sign_in_params
        params.require(:user).permit(:email, :password)
      end

      private

      def respond_to_on_destroy(*)
        if current_api_v1_user
          render_success({ message: "Logged out successfully." })
        else
          render_errors(
            [{ field: "session", message: "No active session found." }],
            status: :unauthorized
          )
        end
      end

      def user_json(user)
        json = user.as_json(only: %i[id email first_name last_name role bio phone social_links])
        if UserAvatarStore.attached?(user.id)
          json["avatar_path"] = api_v1_avatar_path(t: user.avatar_updated_at&.to_i)
        end
        json.merge(
          "subscription" => subscription_json(user),
          token: request.env["warden-jwt_auth.token"]
        )
      end
    end
  end
end
