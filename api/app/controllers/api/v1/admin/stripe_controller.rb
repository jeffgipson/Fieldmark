# frozen_string_literal: true

module Api
  module V1
    module Admin
      class StripeController < BaseController
        def show
          render_success(::Admin::MockStripeDashboard.call)
        end
      end
    end
  end
end
