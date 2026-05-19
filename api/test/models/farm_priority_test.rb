# frozen_string_literal: true

require "test_helper"

class FarmPriorityTest < ActiveSupport::TestCase
  setup do
    @user = User.create!(
      email: "fp-#{SecureRandom.hex(4)}@fieldmark.test",
      password: "password123",
      password_confirmation: "password123",
      first_name: "A",
      last_name: "B"
    )
    @farm = @user.farms.create!(
      name: "Farm",
      total_acres: 100,
      county: "Scott",
      region: :central,
      primary_commodity: :corn
    )
  end

  test "infers category from message text" do
    assert_equal "lender_meeting", FarmPriority.infer_category_from_text("Need to talk to my lender next week")
    assert_equal "input_costs", FarmPriority.infer_category_from_text("March input commitments worry me")
  end

  test "limits active priorities per season" do
    3.times do |i|
      @farm.farm_priorities.create!(
        category: :other,
        note: "Item #{i}",
        season_year: CurrentSeason.year,
        status: :active,
        position: i
      )
    end

    extra = @farm.farm_priorities.build(
      category: :other,
      note: "one too many",
      season_year: CurrentSeason.year,
      status: :active
    )
    assert_not extra.valid?
  end
end
