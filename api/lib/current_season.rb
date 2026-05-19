# frozen_string_literal: true

# Planning season for costs, benchmarks, and scenarios (Extension budgets are annual).
module CurrentSeason
  PLANNING_YEAR = 2026

  class << self
    def year
      ENV.fetch("PLANNING_SEASON_YEAR", PLANNING_YEAR).to_i
    end

    def benchmark_year
      year
    end
  end
end
