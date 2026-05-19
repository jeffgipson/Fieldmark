# frozen_string_literal: true

module Api
  module V1
    class Users::PasswordsController < Devise::PasswordsController
      include JsonResponse

      respond_to :json

      def create
        resource_class.send_reset_password_instructions(resource_params)
        head :no_content
      end

      def update
        self.resource = resource_class.reset_password_by_token(resource_params)
        if resource.errors.empty?
          render_success({ message: I18n.t("emails.password_reset.updated") })
        else
          render_errors(model_errors(resource), status: :unprocessable_entity)
        end
      end

      private

      def resource_params
        params.require(:user).permit(:email, :reset_password_token, :password, :password_confirmation)
      end
    end
  end
end
