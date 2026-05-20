# frozen_string_literal: true

# Vendor monetization — directory inclusion, promotional placement, and revenue share.
# Farmer subscriptions live in SubscriptionPlan.
class VendorListingPlan
  # Required monthly fee to appear in the Fieldmark vendor directory.
  BASE_LISTING_CENTS = 10_000

  # Optional promotional upgrades (on top of base listing; amounts are list prices for ops).
  PROMOTIONAL_CENTS = {
    featured_placement: 9_900,
    premium_placement: 19_900,
    sponsored_campaign: 4_900
  }.freeze

  LEAD_REFERRAL_CENTS = 2_500

  class << self
    def base_listing_dollars
      BASE_LISTING_CENTS / 100.0
    end

    def effective_listing_cents(vendor)
      vendor.monthly_listing_cents.presence || BASE_LISTING_CENTS
    end
  end
end
