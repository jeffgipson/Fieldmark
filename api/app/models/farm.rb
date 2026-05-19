# frozen_string_literal: true

class Farm < ApplicationRecord
  belongs_to :user
  has_many :fields, dependent: :destroy
  has_many :input_costs, through: :fields
  has_many :scenarios, dependent: :destroy
  has_many :analyst_conversations, dependent: :destroy
  has_many :farm_priorities, dependent: :destroy
  has_many :farm_season_snapshots, dependent: :destroy
  has_many :farm_history_imports, dependent: :destroy

  enum :region, { northern: 0, central: 1, southwest: 2 }
  enum :primary_commodity, { corn: 0, soybean: 1, both: 2 }

  validates :name, :total_acres, :county, :region, :primary_commodity, presence: true
  validates :total_acres, numericality: { greater_than: 0 }

  scope :farmer_owned, -> { where(benchmark_cohort: false) }
end
