# frozen_string_literal: true

class FieldRiskProfile < ApplicationRecord
  belongs_to :field

  enum :drainage, { good: 0, moderate: 1, poor: 2 }

  validates :field_id, uniqueness: true
  validates :flood_events_last_5_years,
            numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5 },
            allow_nil: true
end
