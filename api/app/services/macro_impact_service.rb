# frozen_string_literal: true

class MacroImpactService
  BASELINE_DIESEL_PER_GALLON = 3.50
  DIESEL_PASS_THROUGH_RATE = 0.15
  LABOR_FUEL_SHARE = 0.25

  def self.call(farm, season_year: CurrentSeason.year)
    new(farm, season_year:).call
  end

  def initialize(farm, season_year:)
    @farm = farm
    @season_year = season_year
  end

  def call
    drivers = MacroDriver.where(season_year: @season_year).order(:driver_key)
    diesel = drivers.find { |d| d.driver_key == "diesel_price_per_gallon" }
    fertilizer_yoy = drivers.find { |d| d.driver_key == "fertilizer_yoy_pct" }

    costs = FarmOperatingCosts.weighted_per_acre(@farm, season_year: @season_year)
    adjustments = {}

    if diesel
      delta = diesel.value.to_f - BASELINE_DIESEL_PER_GALLON
      custom_bump = (costs[:custom_hire] * DIESEL_PASS_THROUGH_RATE * (delta / BASELINE_DIESEL_PER_GALLON)).round(2)
      labor_bump = (costs[:labor] * LABOR_FUEL_SHARE * (delta / BASELINE_DIESEL_PER_GALLON)).round(2)
      adjustments[:custom_hire] = custom_bump if custom_bump.positive?
      adjustments[:labor] = labor_bump if labor_bump.positive?
    end

    if fertilizer_yoy && fertilizer_yoy.value.to_f.positive?
      adjustments[:fertilizer] = (costs[:fertilizer] * fertilizer_yoy.value.to_f / 100.0).round(2)
    end

    total_bump = adjustments.values.sum.round(2)

    {
      season_year: @season_year,
      drivers: drivers.map { |d| driver_payload(d) },
      suggested_adjustments: adjustments,
      total_suggested_bump_per_acre: total_bump,
      disclaimer: "Macro adjustments are planning assumptions with cited sources — apply only if you want to stress-test costs."
    }
  end

  private

  def driver_payload(driver)
    {
      driver_key: driver.driver_key,
      value: driver.value.to_f,
      source: driver.source,
      source_url: driver.source_url,
      effective_on: driver.effective_on.iso8601
    }
  end
end
