# frozen_string_literal: true

class FieldOperatingCosts
  OPERATING_CATEGORIES = %i[seed fertilizer chemicals labor].freeze
  ALL_CATEGORIES = (OPERATING_CATEGORIES + %i[custom_hire other]).freeze

  def self.per_acre(field, season_year: CurrentSeason.year)
    new(field, season_year:).per_acre
  end

  def initialize(field, season_year:)
    @field = field
    @season_year = season_year
  end

  def per_acre
    totals = ALL_CATEGORIES.index_with { 0.0 }

    @field.input_costs.where(season_year: @season_year).find_each do |cost|
      key = cost.category.to_sym
      totals[key] = cost.amount_per_acre.to_f if totals.key?(key)
    end

    operating = OPERATING_CATEGORIES.sum { |key| totals[key] }
    totals.transform_values { |value| value.round(2) }.merge(
      total_operating: operating.round(2)
    )
  end
end
