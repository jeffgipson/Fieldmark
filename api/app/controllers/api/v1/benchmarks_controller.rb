# frozen_string_literal: true

module Api
  module V1
    class BenchmarksController < BaseController
      def index
        region = params.require(:region)
        commodity = params.require(:commodity)
        year = params.fetch(:year, Date.current.year).to_i

        benchmark = BenchmarkRegion.find_by!(
          region: region,
          commodity: commodity,
          season_year: year
        )

        render_success(benchmark_json(benchmark))
      rescue ActiveRecord::RecordNotFound
        render_errors(
          [{ field: "benchmark", message: "No benchmark found for the given filters." }],
          status: :not_found
        )
      end

      private

      def benchmark_json(benchmark)
        benchmark.as_json(only: %i[
          id region commodity season_year seed_cost_per_acre fertilizer_cost_per_acre
          chemicals_cost_per_acre labor_cost_per_acre total_operating_cost_per_acre
          total_cost_per_acre assumed_yield assumed_price source created_at updated_at
        ])
      end
    end
  end
end
