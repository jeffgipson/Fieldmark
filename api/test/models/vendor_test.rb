# frozen_string_literal: true

require "test_helper"

class VendorTest < ActiveSupport::TestCase
  test "for_county includes statewide and county match" do
    local = Vendor.create!(
      name: "Local Co-op", slug: "local-coop-test", category: :farm_store_coop,
      counties: ["Cape Girardeau"], state: "MO"
    )
    statewide = Vendor.create!(
      name: "State Lender", slug: "state-lender-test", category: :ag_lender,
      serves_statewide: true, state: "MO"
    )
    other = Vendor.create!(
      name: "Other", slug: "other-county-test", category: :other,
      counties: ["Boone"], state: "MO"
    )

    ids = Vendor.for_county("Cape Girardeau").pluck(:id)
    assert_includes ids, local.id
    assert_includes ids, statewide.id
    assert_not_includes ids, other.id
  end
end
