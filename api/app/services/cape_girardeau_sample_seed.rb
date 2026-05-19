# frozen_string_literal: true

# Loads db/seeds/cape_girardeau_sample.json — multiple farmers around Cape Girardeau County, MO.
# Idempotent: upserts users, farms, fields, input costs, and recalculates scenarios.
class CapeGirardeauSampleSeed
  SAMPLE_PATH = Rails.root.join("db/seeds/cape_girardeau_sample.json")
  CAPE_EMAIL_SUFFIX = "@cape.fieldmark.app"

  def self.call(reset: false, only_demo: false)
    new(reset:, only_demo:).call
  end

  def initialize(reset: false, only_demo: false)
    @reset = reset
    @only_demo = only_demo
  end

  def call
    ensure_benchmarks!
    clear_sample_users! if @reset

    farmers = load_farmers
    farmers = farmers.select { |f| f["demo_account"] } if @only_demo

    results = []
    total = farmers.size
    farmers.each_with_index do |attrs, index|
      results << seed_farmer!(attrs)
      next if (index + 1) % 10 != 0 && index + 1 != total

      puts "  … #{index + 1}/#{total} farmers"
    end

    {
      farmers: results,
      password: AppConfig.demo_password,
      total_users: results.size,
      total_fields: results.sum { |r| r[:fields].size }
    }
  end

  private

  def ensure_benchmarks!
    return if BenchmarkRegion.exists?(season_year: CurrentSeason.benchmark_year)

    BenchmarkData::Importer.call
  end

  def clear_sample_users!
    User.where("email LIKE ?", "%#{CAPE_EMAIL_SUFFIX}").destroy_all
  end

  def load_farmers
    raise "Missing #{SAMPLE_PATH}" unless SAMPLE_PATH.exist?

    data = JSON.parse(SAMPLE_PATH.read)
    demo_email = AppConfig.demo_email.downcase

    data.fetch("farmers").map do |farmer|
      row = farmer.deep_dup
      row["email"] = demo_email if row["demo_account"]
      row
    end
  end

  def seed_farmer!(attrs)
    user = upsert_user!(attrs)
    user.farms.destroy_all if @reset

    farm_attrs = attrs.fetch("farm")
    farm = user.farms.find_or_create_by!(name: farm_attrs.fetch("name")) do |f|
      f.assign_attributes(farm_attributes(farm_attrs))
    end
    farm.update!(farm_attributes(farm_attrs))

    fields = farm_attrs.fetch("fields").map do |field_attrs|
      seed_field!(farm, field_attrs)
    end

    scenario = upsert_scenario!(farm, farm_attrs.fetch("scenario"))
    run_calculations!(farm, scenario)

    {
      user: user,
      email: user.email,
      farm: farm,
      fields: fields,
      scenario: scenario
    }
  end

  def upsert_user!(attrs)
    email = attrs.fetch("email").downcase
    user = User.find_or_initialize_by(email: email)
    user.assign_attributes(
      first_name: attrs.fetch("first_name"),
      last_name: attrs.fetch("last_name"),
      password: AppConfig.demo_password,
      password_confirmation: AppConfig.demo_password
    )
    user.skip_welcome_email = true
    user.save!
    if attrs["demo_account"]
      user.update!(
        subscription_plan: :pro,
        subscription_status: :active,
        subscription_current_period_end: 1.month.from_now
      )
      Billing::MockStripeService.ensure_customer!(user)
    end
    user
  end

  def farm_attributes(attrs)
    {
      total_acres: attrs.fetch("total_acres"),
      county: attrs.fetch("county"),
      region: attrs.fetch("region"),
      primary_commodity: attrs.fetch("primary_commodity"),
      latitude: attrs["latitude"],
      longitude: attrs["longitude"]
    }
  end

  def seed_field!(farm, attrs)
    field = farm.fields.find_or_create_by!(name: attrs.fetch("name")) do |f|
      f.assign_attributes(field_attributes(attrs))
    end
    field.update!(field_attributes(attrs))
    seed_input_costs!(field, attrs.fetch("costs"))
    seed_risk_profile!(field, attrs["risk_profile"])
    field
  end

  def seed_risk_profile!(field, attrs)
    return if attrs.blank?

    profile = field.field_risk_profile || field.build_field_risk_profile
    profile.update!(
      flood_events_last_5_years: attrs["flood_events_last_5_years"],
      drainage: attrs.fetch("drainage", "moderate"),
      bottomland: attrs.fetch("bottomland", false),
      risk_notes: attrs["risk_notes"]
    )
  end

  def field_attributes(attrs)
    lat = attrs["latitude"]
    lng = attrs["longitude"]
    acres = attrs.fetch("acres").to_f

    {
      acres: acres,
      soil_type: attrs.fetch("soil_type"),
      primary_commodity: attrs.fetch("primary_commodity"),
      latitude: lat,
      longitude: lng,
      boundary: box_boundary(lat, lng, acres)
    }
  end

  def seed_input_costs!(field, costs)
    costs.each do |category, amount|
      field.input_costs.find_or_create_by!(
        season_year: CurrentSeason.year,
        category: category.to_s
      ) do |cost|
        cost.amount_per_acre = amount
      end
      field.input_costs.find_by!(season_year: CurrentSeason.year, category: category.to_s)
        .update!(amount_per_acre: amount)
    end
  end

  def upsert_scenario!(farm, attrs)
    name = attrs.fetch("name")
    farm.scenarios.find_or_create_by!(name: name) do |s|
      s.assign_attributes(
        commodity_price: attrs.fetch("commodity_price"),
        yield_assumption: attrs.fetch("yield_assumption"),
        downside_commodity_price: attrs.fetch("downside_commodity_price"),
        downside_yield: attrs.fetch("downside_yield")
      )
    end.tap do |scenario|
      scenario.update!(
        commodity_price: attrs.fetch("commodity_price"),
        yield_assumption: attrs.fetch("yield_assumption"),
        downside_commodity_price: attrs.fetch("downside_commodity_price"),
        downside_yield: attrs.fetch("downside_yield")
      )
    end
  end

  def run_calculations!(farm, scenario)
    scenario.update!(results: ScenarioCalculatorService.call(scenario))
    PeerComparisonService.call(scenario)
  end

  # Rough square polygon for map display (~acres).
  def box_boundary(lat, lng, acres)
    return nil if lat.blank? || lng.blank?

    lat = lat.to_f
    lng = lng.to_f
    side_m = Math.sqrt(acres * 4046.86)
    dlat = (side_m / 2.0) / 111_000.0
    dlng = (side_m / 2.0) / (111_000.0 * Math.cos(lat * Math::PI / 180.0))

    {
      "type" => "Polygon",
      "coordinates" => [[
        [lng - dlng, lat - dlat],
        [lng + dlng, lat - dlat],
        [lng + dlng, lat + dlat],
        [lng - dlng, lat + dlat],
        [lng - dlng, lat - dlat]
      ]]
    }
  end
end
