class Scenario < ApplicationRecord
  belongs_to :farm
  has_one :peer_comparison, dependent: :destroy
  has_one :analyst_report, dependent: :destroy
  has_one :decision, dependent: :destroy
  has_many :analyst_conversations, dependent: :destroy

  enum :planning_mode, { forward: 0, goal: 1 }, validate: true

  validates :name, presence: true
  validates :target_total_margin, numericality: { greater_than: 0 }, allow_nil: true
  validates :target_margin_per_acre, numericality: { greater_than: 0 }, allow_nil: true
end
