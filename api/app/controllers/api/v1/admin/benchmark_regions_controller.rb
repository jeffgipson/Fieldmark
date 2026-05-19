# frozen_string_literal: true

module Api
  module V1
    module Admin
      class BenchmarkRegionsController < BaseController
        before_action :set_benchmark_region, only: %i[show update]

        def index
          regions = BenchmarkRegion.order(:region, :commodity, :season_year)
          render_success(regions.map { |r| region_json(r) })
        end

        def show
          render_success(region_json(@benchmark_region))
        end

        def update
          if @benchmark_region.update(benchmark_params)
            render_success(region_json(@benchmark_region))
          else
            render_errors(model_errors(@benchmark_region), status: :unprocessable_entity)
          end
        end

        private

        def set_benchmark_region
          @benchmark_region = BenchmarkRegion.find(params[:id])
        end

        def benchmark_params
          params.require(:benchmark_region).permit(
            :seed_cost_per_acre, :fertilizer_cost_per_acre, :chemicals_cost_per_acre,
            :labor_cost_per_acre, :total_operating_cost_per_acre, :total_cost_per_acre,
            :assumed_yield, :assumed_price, :source, :source_url, :retrieved_on
          )
        end

        def region_json(region)
          region.as_json
        end
      end
    end
  end
end
