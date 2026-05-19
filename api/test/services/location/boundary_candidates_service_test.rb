# frozen_string_literal: true

require "test_helper"

class Location::BoundaryCandidatesServiceTest < ActiveSupport::TestCase
  test "bbox_regrid_radius_m scales with viewport" do
    small = Location::BoundaryCandidatesService.send(
      :bbox_regrid_radius_m,
      32.829, -96.565, 32.831, -96.563
    )
    large = Location::BoundaryCandidatesService.send(
      :bbox_regrid_radius_m,
      32.82, -96.59, 32.84, -96.55
    )

    assert small >= 75
    assert large > small
    assert large <= 1_200
  end
end
