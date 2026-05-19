# frozen_string_literal: true

module Api
  module V1
    class ScenariosController < BaseController
      before_action :set_farm, only: %i[index create]
      before_action :set_scenario, only: %i[show update destroy calculate compare forecast]

      def index
        scenarios = @farm.scenarios.order(:name).page(params[:page]).per(params[:per_page] || 25)
        render_success(scenarios.map { |s| scenario_json(s) }, meta: pagination_meta(scenarios))
      end

      def show
        render_success(scenario_json(@scenario))
      end

      def create
        scenario = @farm.scenarios.build(scenario_params)
        if scenario.save
          render_success(scenario_json(scenario), status: :created)
        else
          render_errors(model_errors(scenario), status: :unprocessable_entity)
        end
      end

      def update
        if @scenario.update(scenario_params)
          render_success(scenario_json(@scenario))
        else
          render_errors(model_errors(@scenario), status: :unprocessable_entity)
        end
      end

      def destroy
        @scenario.destroy!
        render_success({ id: @scenario.id })
      end

      def calculate
        apply_macro = ActiveModel::Type::Boolean.new.cast(params[:apply_macro])
        results = ScenarioCalculatorService.call(@scenario, apply_macro: apply_macro)
        @scenario.update!(results: results)
        render_success(scenario_json(@scenario.reload))
      end

      def compare
        comparison = PeerComparisonService.call(@scenario)
        render_success(
          scenario_json(@scenario.reload).merge(
            peer_comparison: comparison.as_json(
              only: %i[
                id scenario_id benchmark_region_id seed_percentile fertilizer_percentile
                chemicals_percentile total_cost_percentile summary created_at updated_at
              ]
            )
          )
        )
      end

      def forecast
        payload = ForecastProjectionService.call(@scenario)
        render_success(payload)
      end

      private

      def set_farm
        @farm = find_farm!
      end

      def set_scenario
        @scenario = if params[:farm_id]
                      find_farm!.scenarios.find(params[:id])
                    else
                      find_scenario!
                    end
      end

      def scenario_params
        permitted = params.require(:scenario).permit(
          :name, :planning_mode, :commodity_price, :yield_assumption,
          :downside_commodity_price, :downside_yield,
          :target_total_margin, :target_margin_per_acre,
          projection_years: %i[season_year commodity_price yield_assumption operating_escalation_pct]
        )
        normalize_projection_years!(permitted)
        permitted
      end

      def normalize_projection_years!(permitted)
        return unless permitted[:projection_years].is_a?(Array)

        permitted[:projection_years] = permitted[:projection_years].filter_map do |row|
          next if row[:season_year].blank?

          row.to_h.compact
        end
      end

      def scenario_json(scenario)
        scenario.as_json(only: %i[
          id farm_id name planning_mode commodity_price yield_assumption downside_commodity_price
          downside_yield target_total_margin target_margin_per_acre projection_years results
          created_at updated_at
        ])
      end
    end
  end
end
