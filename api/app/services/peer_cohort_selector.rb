# frozen_string_literal: true

class PeerCohortSelector
  MIN_COHORT_SIZE = 5

  def self.call(farm, season_year: CurrentSeason.year)
    new(farm, season_year:).call
  end

  def self.cohort_commodity_for(farm)
    farm.primary_commodity == "soybean" ? "soybean" : "corn"
  end

  def initialize(farm, season_year:)
    @farm = farm
    @season_year = season_year
  end

  def call
    eligible_farms.select do |candidate|
      FarmOperatingCosts.weighted_per_acre(candidate, season_year: @season_year)[:total_operating].positive?
    end
  end

  private

  def eligible_farms
    Farm.farmer_owned
        .where(region: @farm.region)
        .where(primary_commodity: cohort_commodities)
        .where.not(id: @farm.id)
        .includes(fields: :input_costs)
        .to_a
  end

  def cohort_commodities
    if @farm.primary_commodity == "soybean"
      [:soybean]
    else
      [:corn, :both]
    end
  end
end
