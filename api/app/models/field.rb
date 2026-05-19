class Field < ApplicationRecord
  belongs_to :farm
  has_many :input_costs, dependent: :destroy
  has_one :field_risk_profile, dependent: :destroy

  enum :primary_commodity, { corn: 0, soybean: 1 }

  validates :name, presence: true
  validates :acres, presence: true, numericality: { greater_than: 0 }
  validates :soil_type, presence: true
  validates :primary_commodity, presence: true
end
