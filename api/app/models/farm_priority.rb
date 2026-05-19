# frozen_string_literal: true

class FarmPriority < ApplicationRecord
  MAX_ACTIVE_PER_SEASON = 3
  NOTE_MAX_LENGTH = 280

  belongs_to :farm

  enum :category, {
    input_costs: 0,
    cash_flow: 1,
    lender_meeting: 2,
    crop_insurance: 3,
    seed_fertility: 4,
    labor_equipment: 5,
    market_prices: 6,
    other: 7
  }, prefix: true

  enum :status, { active: 0, resolved: 1 }, default: :active
  enum :source, { user: 0, dale_chat: 1, onboarding: 2 }, default: :user

  validates :season_year, presence: true
  validates :note, length: { maximum: NOTE_MAX_LENGTH }, allow_blank: true
  validate :active_limit_per_season, if: -> { active? && (new_record? || status_changed?) }

  scope :for_season, ->(year = CurrentSeason.year) { where(season_year: year) }
  scope :active_for_season, ->(year = CurrentSeason.year) { for_season(year).active.order(:position, :created_at) }

  CATEGORY_LABELS = {
    "input_costs" => "Input costs & March commitments",
    "cash_flow" => "Cash flow & operating credit",
    "lender_meeting" => "Lender or financing conversation",
    "crop_insurance" => "Crop insurance & risk protection",
    "seed_fertility" => "Seed, fertilizer, or chemicals",
    "labor_equipment" => "Labor, equipment, or custom work",
    "market_prices" => "Commodity prices & marketing",
    "other" => "Something else"
  }.freeze

  VENDOR_CATEGORIES = {
    input_costs: %i[fertilizer_chemical farm_store_coop seed_dealer],
    cash_flow: %i[ag_lender],
    lender_meeting: %i[ag_lender],
    crop_insurance: %i[crop_insurance],
    seed_fertility: %i[seed_dealer fertilizer_chemical custom_applicator],
    labor_equipment: %i[custom_applicator],
    market_prices: %i[ag_lender],
    other: []
  }.freeze

  DALE_GUIDANCE = {
    input_costs: "Compare operating costs to regional benchmarks and downside margin before locking in March inputs.",
    cash_flow: "Stress-test cash flow with the downside scenario and timing of operating credit.",
    lender_meeting: "Prepare margin story, peer comparisons, and a lender-ready summary.",
    crop_insurance: "Discuss revenue protection if yields or prices move against the base case.",
    seed_fertility: "Look at seed and fertility spend per acre versus peers in the county.",
    labor_equipment: "Factor custom application and labor into total operating cost per acre.",
    market_prices: "Connect commodity price assumptions to base and downside margins.",
    other: "Ask clarifying questions before recommending numbers the farm has not entered yet."
  }.freeze

  def self.infer_category_from_text(text)
    FarmPriorityCategoryInferrer.call(text)
  end

  private

  def active_limit_per_season
    scope = farm.farm_priorities.active.for_season(season_year).where.not(id: id)
    return if scope.count < MAX_ACTIVE_PER_SEASON

    errors.add(:base, "You can track up to #{MAX_ACTIVE_PER_SEASON} active priorities this season.")
  end
end
