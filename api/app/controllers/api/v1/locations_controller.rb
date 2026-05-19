# frozen_string_literal: true

module Api
  module V1
    class LocationsController < BaseController
      skip_before_action :authenticate_api_v1_user!, only: %i[lookup search boundaries]

      def lookup
        lat = params.require(:latitude)
        lng = params.require(:longitude)
        result = Location::LookupService.call(
          latitude: lat,
          longitude: lng,
          boundary: params[:boundary]
        )
        render_success(result)
      rescue ActionController::ParameterMissing => e
        render_errors([{ field: e.param, message: "is required" }], status: :unprocessable_entity)
      end

      def search
        q = params[:q].to_s.strip
        if q.length < 3
          render_success([])
          return
        end

        render_success(Location::SearchService.call(query: q, limit: params.fetch(:limit, 6).to_i.clamp(1, 10)))
      end

      # Nearby field/parcel polygons (OSM farmland; optional Regrid parcels with REGRID_API_KEY).
      def boundaries
        result = if bbox_params?
                   Location::BoundaryCandidatesService.call_with_diagnostics(**bbox_query_params)
                 else
                   Location::BoundaryCandidatesService.call_with_diagnostics(
                     latitude: params.require(:latitude),
                     longitude: params.require(:longitude)
                   )
                 end

        render_success(
          result.candidates,
          meta: {
            sources: sources_meta,
            diagnostics: result.diagnostics,
            zoom_hint: "Zoom in to see more mapped field outlines."
          }
        )
      rescue ActionController::ParameterMissing => e
        render_errors([{ field: e.param, message: "is required" }], status: :unprocessable_entity)
      end

      private

      def bbox_params?
        params[:south].present? && params[:west].present? && params[:north].present? && params[:east].present?
      end

      def bbox_query_params
        {
          south: params[:south],
          west: params[:west],
          north: params[:north],
          east: params[:east],
          latitude: params[:latitude],
          longitude: params[:longitude]
        }.compact
      end

      def sources_meta
        {
          openstreetmap: true,
          regrid: AppConfig.respond_to?(:regrid_api_key) && AppConfig.regrid_api_key.present?
        }
      end
    end
  end
end
