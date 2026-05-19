# frozen_string_literal: true

module Api
  module V1
    class ProfilesController < BaseController
      include UserProfileSerialization

      def show
        render_success(profile_json(current_user))
      end

      def update
        if current_user.update_profile!(profile_params.to_h)
          render_success(profile_json(current_user.reload))
        else
          render_errors(model_errors(current_user), status: :unprocessable_entity)
        end
      end

      def credentials
        unless current_user.update_credentials!(**credentials_params.to_h.symbolize_keys)
          return render_errors(model_errors(current_user), status: :unprocessable_entity)
        end

        render_success(profile_json(current_user.reload))
      end

      private

      def profile_params
        params.require(:user).permit(:first_name, :last_name, :bio, :phone, social_links: User::SOCIAL_LINK_KEYS)
      end

      def credentials_params
        params.require(:user).permit(:current_password, :email, :password, :password_confirmation)
      end
    end
  end
end
