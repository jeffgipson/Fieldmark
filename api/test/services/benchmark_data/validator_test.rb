# frozen_string_literal: true

require "test_helper"

class BenchmarkDataValidatorTest < ActiveSupport::TestCase
  # fixtures :all # Disabling fixtures for this test

  test "should be valid with correct data" do
    record = {
      "source" => "Extension 2026 - g651",
      "url" => "https://example.com",
      "commodity" => "corn",
      "irrigation" => "dryland",
      "season_year" => 2026,
      "assumed_yield_bu_per_acre" => 176,
      "assumed_price_per_bu" => 4.33,
      "regions" => ["central"],
      "costs_per_acre" => {
        "seed" => 99.38,
        "fertilizer" => 187.01,
        "chemicals" => 104.00,
        "labor" => 22.60,
        "custom_hire" => 19.97,
        "drying" => 26.40,
        "supplies_storage_marketing" => 8.50,
        "consulting_insurance" => 18.00,
        "machinery_fuel" => 21.76,
        "machinery_repairs" => 32.11,
        "management" => 39.35,
        "operating_interest" => 20.99,
        "total_operating" => 600.07,
        "farm_overhead" => 23.61,
        "machinery_ownership" => 93.78,
        "real_estate" => 185.00,
        "total_ownership" => 302.40,
        "total_costs" => 902.47
      }
    }
    BenchmarkData::Importer.new.send(:import_record, record)
    assert_equal 1, BenchmarkRegion.count
  end

  test "should return error if required field is missing" do
    record = { "source" => "test" }
    errors = BenchmarkData::Validator.call(record)
    assert_not_empty errors
  end
end
