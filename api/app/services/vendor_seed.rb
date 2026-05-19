# frozen_string_literal: true

class VendorSeed
  SEED_PATH = Rails.root.join("db/seeds/vendors_cape_girardeau.json")

  def self.call
    new.call
  end

  def call
    raise "Missing #{SEED_PATH}" unless SEED_PATH.exist?

    data = JSON.parse(SEED_PATH.read)
    count = 0
    data.fetch("vendors").each do |row|
      vendor = Vendor.find_or_initialize_by(slug: row.fetch("slug"))
      vendor.assign_attributes(
        name: row.fetch("name"),
        category: row.fetch("category"),
        description: row["description"],
        website: row["website"],
        phone: row["phone"],
        email: row["email"],
        street_address: row["street_address"],
        city: row["city"],
        state: row.fetch("state", "MO"),
        region: row["region"],
        counties: row.fetch("counties", []),
        serves_statewide: row.fetch("serves_statewide", false),
        listing_tier: row.fetch("listing_tier", "standard"),
        sponsored: row.fetch("sponsored", false),
        featured_until: row["featured_until"],
        active: row.fetch("active", true),
        billing_notes: row["billing_notes"],
        monthly_listing_cents: row["monthly_listing_cents"],
        profile_summary: row["profile_summary"],
        offerings: row.fetch("offerings", []),
        latitude: row["latitude"],
        longitude: row["longitude"]
      )
      VendorProfileEnricher.call(vendor)
      VendorGeocoder.apply!(vendor) if vendor.profile_page?
      vendor.save!
      count += 1
    end

    slugs = data.fetch("vendors").map { |row| row.fetch("slug") }
    Vendor.where.not(slug: slugs).update_all(active: false)

    { count: count, active: Vendor.active.count }
  end
end
