# frozen_string_literal: true

class BenchmarkRegion < ApplicationRecord
  has_many :peer_comparisons, dependent: :destroy

  enum :region, { northern: 0, central: 1, southwest: 2 }
  enum :commodity, { corn: 0, soybean: 1 }
  enum :irrigation, { dryland: 0, irrigated: 1 }, default: :dryland

  validates :region, :commodity, :season_year, :source, presence: true
  validates :season_year, numericality: { only_integer: true, greater_than: 2000 }
  validates :seed_cost_per_acre, :fertilizer_cost_per_acre, :chemicals_cost_per_acre,
            :labor_cost_per_acre, :total_operating_cost_per_acre, :total_cost_per_acre,
            :assumed_yield, :assumed_price,
            presence: true, numericality: { greater_than_or_equal_to: 0 }

  def self.import_from_json!(record)
    # This will be implemented in a later step
  end
end
