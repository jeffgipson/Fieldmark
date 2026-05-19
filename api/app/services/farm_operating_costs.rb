# frozen_string_literal: true

class FarmOperatingCosts
  def self.weighted_per_acre(farm, season_year: CurrentSeason.year)
    new(farm, season_year:).weighted_per_acre
  end

  def initialize(farm, season_year:)
    @farm = farm
    @season_year = season_year
  end

  def weighted_per_acre
    totals = Hash.new(0.0)
    total_acres = @farm.fields.sum(:acres).to_f
    return empty_totals if total_acres.zero?

    @farm.fields.includes(:input_costs).find_each do |field|
      weight = field.acres.to_f / total_acres
      field_costs = FieldOperatingCosts.per_acre(field, season_year: @season_year)
      FieldOperatingCosts::ALL_CATEGORIES.each do |key|
        totals[key] += field_costs[key] * weight
      end
    end

    operating = totals[:seed] + totals[:fertilizer] + totals[:chemicals] + totals[:labor]
    {
      seed: totals[:seed].round(2),
      fertilizer: totals[:fertilizer].round(2),
      chemicals: totals[:chemicals].round(2),
      labor: totals[:labor].round(2),
      custom_hire: totals[:custom_hire].round(2),
      other: totals[:other].round(2),
      total_operating: operating.round(2)
    }
  end

  private

  def empty_totals
    {
      seed: 0.0,
      fertilizer: 0.0,
      chemicals: 0.0,
      labor: 0.0,
      custom_hire: 0.0,
      other: 0.0,
      total_operating: 0.0
    }
  end
end
