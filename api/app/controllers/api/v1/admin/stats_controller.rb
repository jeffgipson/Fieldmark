# frozen_string_literal: true

module Api
  module V1
    module Admin
      class StatsController < BaseController
        def show
          render_success({
            users: User.count,
            farms: Farm.count,
            fields: Field.count,
            scenarios: Scenario.count,
            vendors: Vendor.count
          })
        end
      end
    end
  end
end
