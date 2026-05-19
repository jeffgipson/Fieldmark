# frozen_string_literal: true

class Vendor < ApplicationRecord
  has_many :user_vendor_contacts, dependent: :destroy
  has_many :users, through: :user_vendor_contacts
  has_many :decisions, dependent: :nullify

  enum :category, {
    ag_lender: 0,
    seed_dealer: 1,
    farm_store_coop: 2,
    fertilizer_chemical: 3,
    crop_insurance: 4,
    grain_merchandiser: 5,
    equipment_dealer: 6,
    farm_accounting: 7,
    custom_applicator: 8,
    agronomist: 9,
    farm_attorney: 10,
    other: 11
  }

  enum :region, { northern: 0, central: 1, southwest: 2 }, prefix: :region
  enum :listing_tier, { standard: 0, featured: 1, premium: 2 }, prefix: :tier

  validates :name, :slug, :category, presence: true
  validates :slug, uniqueness: true
  validates :state, presence: true

  before_validation :normalize_slug

  scope :active, -> { where(active: true) }
  scope :for_category, ->(category) { where(category: category) if category.present? }
  scope :for_region, ->(region) { where(region: region).or(where(region: nil)) if region.present? }

  scope :for_county, lambda { |county|
    return all if county.blank?

    where(serves_statewide: true).or(where("counties @> ?", [county].to_json))
  }

  scope :ordered_for_display, lambda {
    order(
      Arel.sql(
        "CASE listing_tier WHEN 2 THEN 0 WHEN 1 THEN 1 ELSE 2 END, sponsored DESC, name ASC"
      )
    )
  }

  def partner_badge?
    sponsored? || !tier_standard? || (featured_until.present? && featured_until >= Date.current)
  end

  def profile_page?
    partner_badge?
  end

  def full_address
    parts = [street_address, city, state].compact_blank
    parts.join(", ").presence
  end

  private

  def normalize_slug
    self.slug = name.to_s.parameterize if slug.blank? && name.present?
  end
end
