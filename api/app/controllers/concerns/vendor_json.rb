# frozen_string_literal: true

module VendorJson
  extend ActiveSupport::Concern

  private

  def vendor_json(vendor, admin: false, favorited: nil)
    fields = %i[
      id name slug category description website phone email
      street_address city state region counties serves_statewide
      listing_tier sponsored featured_until active
    ]
    fields << :billing_notes << :monthly_listing_cents if admin
    json = vendor.as_json(only: fields).merge(
      "partner" => vendor.partner_badge?,
      "has_profile" => vendor.profile_page?,
      **HunterLogo.payload_for_website(vendor.website)
    )
    json["favorited"] = favorited unless favorited.nil?
    json
  end

  def favorited_vendor_ids
    @favorited_vendor_ids ||= current_user.user_vendor_contacts.pluck(:vendor_id).to_set
  end

  def enrich_vendors_with_favorites!(vendors)
    ids = favorited_vendor_ids
    vendors.each { |v| v["favorited"] = ids.include?(v["id"]) }
  end

  def vendor_profile_json(vendor, favorited: nil)
    vendor_json(vendor, favorited: favorited).merge(
      "has_profile" => vendor.profile_page?,
      "profile_summary" => vendor.profile_summary.presence || vendor.description,
      "offerings" => Array(vendor.offerings),
      "latitude" => vendor.latitude&.to_f,
      "longitude" => vendor.longitude&.to_f,
      "full_address" => vendor.full_address
    )
  end
end
