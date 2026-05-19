# frozen_string_literal: true

class VendorRecommendationService
  MAX_CATEGORIES = 4
  MAX_VENDORS_PER_CATEGORY = 5
  MAX_FEATURED_PER_CATEGORY = 2

  CATEGORY_LABELS = Vendor.categories.keys.index_with { |k| k.to_s.humanize }.freeze

  def self.call(farm:, scenario: nil)
    new(farm:, scenario:).call
  end

  def initialize(farm:, scenario: nil)
    @farm = farm
    @scenario = scenario
    @county = farm.county
    @region = farm.region
  end

  def call
    categories = triggered_categories
    {
      county: @county,
      region: @region,
      recommendations: categories.map { |entry| build_recommendation(entry) }
    }
  end

  private

  def triggered_categories
    items = []
    items.concat(priority_triggered_items)

    pc = @scenario&.peer_comparison&.summary&.dig("categories") || {}

    add_if_above_peer(items, pc, "fertilizer", %i[fertilizer_chemical farm_store_coop])
    add_if_above_peer(items, pc, "seed", %i[seed_dealer])
    add_if_above_peer(items, pc, "chemicals", %i[fertilizer_chemical custom_applicator])

    if downside_risk?
      items << { category: :ag_lender, reason: downside_reason }
      items << { category: :crop_insurance, reason: "Crop insurance can protect revenue if yields or prices slip." }
    end

    if days_until_march <= 90
      items << { category: :ag_lender, reason: "Operating lines and input financing often close before March planting commitments." }
    end

    dedupe_categories(items).first(MAX_CATEGORIES)
  end

  def priority_triggered_items
    @farm.farm_priorities.active_for_season.flat_map do |priority|
      categories = FarmPriority::VENDOR_CATEGORIES[priority.category.to_sym] || []
      next [] if categories.empty?

      label = FarmPriority::CATEGORY_LABELS[priority.category]
      reason = priority.note.presence ||
               "You flagged #{label.downcase} as a priority this season."
      categories.map do |cat|
        { category: cat, reason: reason, from_priority: priority.category }
      end
    end
  end

  def add_if_above_peer(items, pc, key, categories)
    row = pc[key]
    return unless row.is_a?(Hash)

    if row.key?("difference_vs_peer_per_acre") && !row["difference_vs_peer_per_acre"].nil?
      diff = row["difference_vs_peer_per_acre"].to_f
      reference = "peer median"
    else
      diff = row["difference_vs_benchmark_per_acre"].to_f
      reference = "Extension budget"
    end
    return unless diff.positive?

    rounded = diff.round(0)
    categories.each do |cat|
      items << {
        category: cat,
        reason: "#{key.capitalize} runs about $#{rounded}/ac above the #{reference} — worth comparing quotes."
      }
    end
  end

  def downside_risk?
    base = @scenario&.results&.dig("base_case", "margin_per_acre")
    down = @scenario&.results&.dig("downside_case", "margin_per_acre")
    return false if base.nil? || down.nil?

    down.to_f < base.to_f - 25
  end

  def downside_reason
    down = @scenario.results.dig("downside_case", "margin_per_acre")
    "Downside margin (#{down&.round(0)}/ac) is thinner than base case — lenders often want that story before March."
  end

  def days_until_march
    today = Date.current
    march1 = Date.new(today.year, 3, 1)
    march1 = Date.new(today.year + 1, 3, 1) if today > march1
    (march1 - today).to_i
  end

  def dedupe_categories(items)
    seen = {}
    items.each_with_object([]) do |item, acc|
      next if seen[item[:category]]

      seen[item[:category]] = true
      acc << item
    end
  end

  def build_recommendation(entry)
    vendors = Vendor.active
      .for_county(@county)
      .for_region(@region)
      .for_category(entry[:category])
      .ordered_for_display
      .limit(MAX_VENDORS_PER_CATEGORY)

    {
      category: entry[:category].to_s,
      category_label: CATEGORY_LABELS[entry[:category].to_s] || entry[:category].to_s.humanize,
      reason: entry[:reason],
      vendors: vendors.map { |v| vendor_json(v) }
    }
  end

  def vendor_json(vendor)
    vendor.as_json(only: %i[
      id name slug category description website phone email city state region
      counties serves_statewide listing_tier sponsored featured_until
    ]).merge(
      "partner" => vendor.partner_badge?,
      "has_profile" => vendor.profile_page?
    )
  end
end
