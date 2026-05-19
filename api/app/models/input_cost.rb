# frozen_string_literal: true

class InputCost < ApplicationRecord
  belongs_to :field

  enum :category, {
    seed: 0,
    fertilizer: 1,
    chemicals: 2,
    labor: 3,
    custom_hire: 4,
    other: 5
  }

  validates :season_year, presence: true, numericality: { only_integer: true, greater_than: 2000 }
  validates :category, presence: true
  validates :amount_per_acre, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
