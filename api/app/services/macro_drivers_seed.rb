# frozen_string_literal: true

class MacroDriversSeed
  def self.call
    year = CurrentSeason.year
    rows = [
      {
        driver_key: "diesel_price_per_gallon",
        value: 3.85,
        source: "U.S. EIA — Midwest No. 2 diesel (planning assumption)",
        source_url: "https://www.eia.gov/petroleum/gasdiesel/",
        effective_on: Date.new(year, 3, 1)
      },
      {
        driver_key: "fertilizer_yoy_pct",
        value: 4.5,
        source: "Extension budget YoY trend (planning assumption)",
        source_url: "https://extension.missouri.edu/",
        effective_on: Date.new(year, 1, 1)
      }
    ]

    rows.each do |attrs|
      MacroDriver.find_or_initialize_by(season_year: year, driver_key: attrs[:driver_key]).update!(attrs)
    end
  end
end
