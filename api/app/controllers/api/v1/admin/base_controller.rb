# frozen_string_literal: true

module Api
  module V1
    module Admin
      class BaseController < Api::V1::BaseController
        before_action :require_admin!

        private

        def require_admin!
          return if current_user.admin?

          render_errors(
            [{ field: "authorization", message: "Admin access required." }],
            status: :forbidden
          ) and return
        end
      end
    end
  end
end
