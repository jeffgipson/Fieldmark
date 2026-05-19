# frozen_string_literal: true

class VendorProfileEnricher
  CATEGORY_OFFERINGS = {
    "ag_lender" => [
      "Operating lines for spring input commitments",
      "Land and real estate financing",
      "Equipment and livestock loans",
      "Seasonal cash-flow planning with a local loan officer"
    ],
    "seed_dealer" => [
      "Corn and soybean seed for southeast Missouri soils",
      "Hybrid placement and population guidance",
      "Early-order and volume pricing conversations",
      "On-farm delivery and pickup options"
    ],
    "farm_store_coop" => [
      "Seed, fertilizer, and crop protection products",
      "Feed and farm supply retail",
      "Custom application and spreading services",
      "Member pricing and seasonal programs"
    ],
    "fertilizer_chemical" => [
      "Dry and liquid fertilizer programs",
      "Herbicide, fungicide, and insecticide recommendations",
      "Custom application and tender trucks",
      "Soil sampling and variable-rate planning"
    ],
    "crop_insurance" => [
      "Multi-Peril Crop Insurance (MPCI) policies",
      "Revenue protection and yield coverage options",
      "Prevented planting and replant guidance",
      "Claims support through harvest"
    ],
    "grain_merchandiser" => [
      "Cash bids and forward contracting",
      "On-farm grain pickup or elevator delivery",
      "Drying, storage, and basis discussions",
      "Marketing plans tied to your delivery windows"
    ],
    "equipment_dealer" => [
      "New and used tractors, planters, and combines",
      "Parts counter and shop service",
      "Precision ag and technology installs",
      "Lease and finance programs"
    ],
    "farm_accounting" => [
      "Farm tax preparation and planning",
      "Bookkeeping and entity structure advice",
      "Cash-basis and accrual reporting",
      "Lender-ready financial statements"
    ],
    "custom_applicator" => [
      "Custom spraying and spreading",
      "Variable-rate fertilizer application",
      "Aerial or ground rig availability by season",
      "Chemical mixing and record-keeping"
    ],
    "agronomist" => [
      "In-season scouting and tissue testing",
      "Fertility and seeding rate recommendations",
      "Weed resistance and trait stewardship",
      "Trial plots and product comparison"
    ],
    "farm_attorney" => [
      "Farm leases and land purchases",
      "Entity formation and succession planning",
      "Contract review for inputs and land",
      "Estate and family farm transitions"
    ],
    "other" => [
      "Local farm business services",
      "Seasonal support for Missouri growers",
      "Ask about availability before March commitments"
    ]
  }.freeze

  def self.call(vendor)
    new(vendor).call
  end

  def initialize(vendor)
    @vendor = vendor
  end

  def call
    return @vendor unless @vendor.partner_badge?

    @vendor.profile_summary = build_summary if @vendor.profile_summary.blank?
    @vendor.offerings = default_offerings if @vendor.offerings.blank?
    @vendor
  end

  private

  def build_summary
    base = @vendor.description.to_s.strip
    county_line = county_phrase
    parts = []
    parts << base if base.present?
    parts << county_line if county_line.present?
    parts << category_context
    parts.compact.join(" ")
  end

  def county_phrase
    counties = Array(@vendor.counties).reject(&:blank?)
    if @vendor.serves_statewide?
      "Serves Missouri growers statewide with local staff in #{@vendor.city}."
    elsif counties.any?
      "Works with farmers in #{counties.first(3).join(', ')}#{counties.size > 3 ? ', and nearby counties' : ''}."
    elsif @vendor.city.present?
      "Based in #{@vendor.city}, #{@vendor.state}."
    end
  end

  def category_context
    case @vendor.category
    when "ag_lender"
      "Independent of Fieldmark — compare rates and covenants before you sign spring paperwork."
    when "crop_insurance"
      "Licensed agents can walk through coverage levels before planting decisions lock in."
    when "seed_dealer", "fertilizer_chemical", "farm_store_coop"
      "Compare quotes against your benchmark costs — Fieldmark does not endorse any single supplier."
    else
      "Listed as a local partner — verify services and pricing directly with their team."
    end
  end

  def default_offerings
    CATEGORY_OFFERINGS.fetch(@vendor.category.to_s, CATEGORY_OFFERINGS["other"]).dup
  end
end
