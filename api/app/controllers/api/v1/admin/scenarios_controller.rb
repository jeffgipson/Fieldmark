# frozen_string_literal: true

module Api
  module V1
    module Admin
      class ScenariosController < BaseController
        before_action :set_farm
        before_action :set_scenario, only: %i[show update destroy calculate compare]

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
          results = ScenarioCalculatorService.call(@scenario)
          @scenario.update!(results: results)
          render_success(scenario_json(@scenario.reload))
        end

        def compare
          comparison = PeerComparisonService.call(@scenario)
          render_success(
            scenario_json(@scenario.reload).merge(
              peer_comparison: comparison.as_json(
                only: %i[id summary seed_percentile fertilizer_percentile chemicals_percentile total_cost_percentile]
              )
            )
          )
        end

        private

        def set_farm
          @farm = Farm.find(params[:farm_id])
        end

        def set_scenario
          @scenario = Scenario.find(params[:id])
        end

        def scenario_params
          params.require(:scenario).permit(:name, :yield_assumption, :commodity_price, :downside_yield, :downside_commodity_price)
        end

        def scenario_json(scenario)
          scenario.as_json(only: %i[id name yield_assumption commodity_price downside_yield downside_commodity_price results created_at])
        end
      end
    end
  end
end
