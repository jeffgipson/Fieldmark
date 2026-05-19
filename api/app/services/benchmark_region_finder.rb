# frozen_string_literal: true

class BenchmarkRegionFinder
  def self.for_farm(farm, season_year: CurrentSeason.benchmark_year)
    new(farm, season_year:).call
  end

  def initialize(farm, season_year: CurrentSeason.benchmark_year)
    @farm = farm
    @season_year = season_year
  end

  def call
    BenchmarkRegion.find_by(
      region: @farm.region,
      commodity: benchmark_commodity,
      season_year: @season_year
    )
  end

  private

  def benchmark_commodity
    @farm.primary_commodity == "soybean" ? :soybean : :corn
  end
end
