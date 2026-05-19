# frozen_string_literal: true

require "test_helper"

class Location::SearchServiceTest < ActiveSupport::TestCase
  test "nominatim_query does not append Missouri for Dallas TX" do
    assert_equal "dallas tx, USA", Location::SearchService.nominatim_query("dallas tx")
  end

  test "nominatim_query biases Missouri for local place names" do
    assert_equal "cape girardeau, Missouri, USA", Location::SearchService.nominatim_query("cape girardeau")
  end

  test "nominatim_query respects explicit Missouri" do
    assert_equal "springfield, MO, USA", Location::SearchService.nominatim_query("springfield, MO")
  end

  test "trial_area_search detects Regrid demo regions" do
    assert Location::SearchService.trial_area_search?("dallas tx")
    assert Location::SearchService.trial_area_search?("marion county in")
    assert_not Location::SearchService.trial_area_search?("cape girardeau")
  end
end
