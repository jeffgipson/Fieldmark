# frozen_string_literal: true

require "test_helper"

class PeerCohortSelectorTest < ActiveSupport::TestCase
  fixtures :users, :farms, :fields, :input_costs, :benchmark_regions

  test "excludes current farm and matches region and commodity" do
    farm = farms(:henderson)
    cohort = PeerCohortSelector.call(farm)

    assert cohort.size >= PeerCohortSelector::MIN_COHORT_SIZE
    assert cohort.none? { |f| f.id == farm.id }
    assert cohort.all? { |f| f.region == farm.region }
    assert cohort.all? { |f| %w[corn both].include?(f.primary_commodity) }
  end

  test "excludes farms without operating costs" do
    farm = farms(:henderson)
    empty_farm = farms(:northern_farm)
    InputCost.where(field_id: empty_farm.field_ids).delete_all

    cohort = PeerCohortSelector.call(farm)
    assert cohort.none? { |f| f.id == empty_farm.id }
  end
end
