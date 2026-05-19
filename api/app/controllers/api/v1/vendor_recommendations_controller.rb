# frozen_string_literal: true

module Api
  module V1
    class VendorRecommendationsController < BaseController
      include VendorJson

      def index
        farm = resolve_farm!
        scenario = resolve_scenario(farm)
        payload = VendorRecommendationService.call(farm:, scenario:)
        payload[:recommendations]&.each do |rec|
          enrich_vendors_with_favorites!(rec[:vendors])
        end
        render_success(payload)
      end

      private

      def resolve_farm!
        if params[:farm_id].present?
          find_farm!(params[:farm_id])
        else
          current_user.farms.order(:id).first || raise(ActiveRecord::RecordNotFound)
        end
      end

      def resolve_scenario(farm)
        if params[:scenario_id].present?
          farm.scenarios.find(params[:scenario_id])
        else
          farm.scenarios.order(:id).first
        end
      end
    end
  end
end
