# frozen_string_literal: true

require "test_helper"

class Location::LookupServiceTest < ActiveSupport::TestCase
  test "polygon area returns positive acres" do
    boundary = {
      "type" => "Polygon",
      "coordinates" => [[
        [-89.62, 37.28],
        [-89.58, 37.28],
        [-89.58, 37.31],
        [-89.62, 37.31],
        [-89.62, 37.28]
      ]]
    }

    acres = Location::PolygonArea.acres_from_geojson(boundary)
    assert acres.to_f.positive?
  end

  test "missouri county maps to benchmark region" do
    assert_equal "central", Location::MissouriRegions.region_for_county("Cape Girardeau")
    assert_equal "southwest", Location::MissouriRegions.region_for_county("Greene")
    assert_equal "northern", Location::MissouriRegions.region_for_county("Nodaway")
  end

  test "coordinate fallback for northern missouri" do
    assert_equal "northern", Location::MissouriRegions.region_for_coordinates(40.1, -92.5)
  end
end
