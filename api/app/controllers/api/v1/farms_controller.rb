# frozen_string_literal: true

module Api
  module V1
    class FarmsController < BaseController
      include FarmSerialization
      include EnforcesSubscription

      before_action :authorize_farm_creation!, only: [:create]
      before_action :set_farm, only: %i[show update destroy yield_context benchmark_trends summary underwriting]

      def index
        farms = current_user_farms.order(:name).page(params[:page]).per(params[:per_page] || 25)
        render_success(farms.map { |f| farm_json(f) }, meta: pagination_meta(farms))
      end

      def show
        render_success(farm_json(@farm))
      end

      def create
        farm = current_user.farms.build(farm_params)
        if farm.save
          render_success(farm_json(farm), status: :created)
        else
          render_errors(model_errors(farm), status: :unprocessable_entity)
        end
      end

      def update
        if @farm.update(farm_params)
          render_success(farm_json(@farm))
        else
          render_errors(model_errors(@farm), status: :unprocessable_entity)
        end
      end

      def destroy
        @farm.destroy!
        render_success({ id: @farm.id })
      end

      def yield_context
        render_success(
          YieldContextService.call(@farm).merge(
            regional_risk: RegionalRiskContextService.call(@farm)
          )
        )
      end

      def benchmark_trends
        render_success(BenchmarkTrendService.call(@farm))
      end

      def summary
        scenario = resolve_summary_scenario
        render_success(FarmSummaryService.call(@farm, scenario: scenario))
      end

      def underwriting
        scenario = resolve_summary_scenario
        render_success(FarmUnderwritingService.call(@farm, scenario: scenario))
      end

      private

      def resolve_summary_scenario
        if params[:scenario_id].present?
          return @farm.scenarios.find(params[:scenario_id])
        end

        @farm.scenarios.order(:name).find { |s| s.results.is_a?(Hash) && s.results["base_case"].present? }
      end

      def set_farm
        @farm = find_farm!(params[:id])
      end

      def farm_params
        raw = params.require(:farm)
        permitted = raw.permit(
          :name, :total_acres, :county, :region, :primary_commodity, :latitude, :longitude
        )
        permitted[:boundary] = raw[:boundary] if raw.key?(:boundary)
        permitted[:location_meta] = raw[:location_meta] if raw.key?(:location_meta)
        permitted
      end

    end
  end
end
