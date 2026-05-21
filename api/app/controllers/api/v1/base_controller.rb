# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include JsonResponse

      before_action :authenticate_api_v1_user!

      private

      def current_user
        current_api_v1_user
      end

      def current_user_farms
        if current_user.admin?
          Farm.all
        else
          current_user.farms
        end
      end

      def find_farm!(farm_id = params[:farm_id])
        current_user_farms.find(farm_id)
      end

      def find_field!(field_id = params[:field_id])
        Field.joins(:farm).merge(current_user_farms).find(field_id)
      end

      def find_scenario!(scenario_id = params[:scenario_id] || params[:id])
        Scenario.joins(:farm).merge(current_user_farms).find(scenario_id)
      end

      def pagination_meta(collection)
        {
          page: collection.current_page,
          per_page: collection.limit_value,
          total: collection.total_count
        }
      end

      # GeoJSON / location_meta arrive as nested params — must convert before assign (Rails 8 UnfilteredParameters).
      def json_param_to_hash(value)
        return value.as_json if value.is_a?(ActionController::Parameters)
        return value if value.is_a?(Hash)

        value
      end
    end
  end
end
