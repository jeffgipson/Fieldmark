# frozen_string_literal: true

module Api
  module V1
    module Admin
      class StatsController < BaseController
        def show
          render_success(::Admin::DashboardData.call)
        end
      end
    end
  end
end
