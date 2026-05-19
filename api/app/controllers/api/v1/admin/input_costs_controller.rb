# frozen_string_literal: true

module Api
  module V1
    module Admin
      class InputCostsController < BaseController
        before_action :set_field
        before_action :set_input_cost, only: %i[update destroy]

        def index
          costs = @field.input_costs.by_season(CurrentSeason.year).order(:category)
          render_success(costs.map { |c| input_cost_json(c) })
        end

        def create
          cost = @field.input_costs.build(input_cost_params.merge(season_year: CurrentSeason.year))
          if cost.save
            render_success(input_cost_json(cost), status: :created)
          else
            render_errors(model_errors(cost), status: :unprocessable_entity)
          end
        end

        def update
          if @input_cost.update(input_cost_params)
            render_success(input_cost_json(@input_cost))
          else
            render_errors(model_errors(@input_cost), status: :unprocessable_entity)
          end
        end

        def destroy
          @input_cost.destroy!
          render_success({ id: @input_cost.id })
        end

        private

        def set_field
          @field = Field.find(params[:field_id])
        end

        def set_input_cost
          @input_cost = @field.input_costs.find(params[:id])
        end

        def input_cost_params
          params.require(:input_cost).permit(:category, :amount_per_acre, :notes)
        end

        def input_cost_json(cost)
          cost.as_json(only: %i[id category amount_per_acre notes season_year])
        end
      end
    end
  end
end
