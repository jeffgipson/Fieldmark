# frozen_string_literal: true

module Api
  module V1
    class MapConfigController < BaseController
      # Parcel tile layer for Leaflet (token stays server-side; client uses session auth to fetch).
      def show
        render_success(
          {
            regrid_tiles: regrid_tiles_config,
            regrid_property_app_url: regrid_property_app_url,
            google_maps_api_key: google_maps_api_key_for_client
          }
        )
      end

      private

      def regrid_tiles_config
        return nil unless AppConfig.regrid_api_key.present?

        {
          url_template: "https://tiles.regrid.com/api/v1/parcels/{z}/{x}/{y}.png?token=#{AppConfig.regrid_api_key}",
          attribution: '&copy; <a href="https://regrid.com">Regrid</a>',
          min_zoom: 13,
          max_zoom: 21,
          opacity: 0.85
        }
      end

      def regrid_property_app_url
        "https://app.regrid.com/us"
      end

      # Supports stale dev servers that booted before AppConfig.google_maps_api_key existed.
      def google_maps_api_key_for_client
        if AppConfig.respond_to?(:google_maps_api_key)
          AppConfig.google_maps_api_key
        else
          ENV.fetch("GOOGLE_MAPS_API_KEY", nil).presence ||
            ENV.fetch("VITE_GOOGLE_MAPS_API_KEY", nil).presence
        end
      end
    end
  end
end
