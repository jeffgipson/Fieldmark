# frozen_string_literal: true

class FarmSeasonSnapshot < ApplicationRecord
  belongs_to :farm

  enum :source, { farmer_entered: 0, import: 1 }

  validates :season_year, presence: true, numericality: { only_integer: true, greater_than: 2000 }
  validates :season_year, uniqueness: { scope: :farm_id }
  validates :actual_yield, numericality: { greater_than: 0 }, allow_nil: true
  validates :actual_price, numericality: { greater_than: 0 }, allow_nil: true
  validates :actual_total_operating_per_acre, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
