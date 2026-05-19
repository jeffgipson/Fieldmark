# frozen_string_literal: true

require "test_helper"

class YieldContextServiceTest < ActiveSupport::TestCase
  fixtures :users, :farms

  test "returns NASS yield stats for corn farm" do
    farm = farms(:henderson)
    farm.update!(primary_commodity: :corn)

    result = YieldContextService.call(farm)

    assert result[:available]
    assert result[:p10_yield].positive?
    assert_equal "USDA NASS Quick Stats", result[:source]
    assert_equal result[:p10_yield], result[:suggested_downside_yield]
  end
end
