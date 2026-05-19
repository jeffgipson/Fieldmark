# frozen_string_literal: true

require "set"

class FieldPeerAggregator
  MIN_FIELD_COHORT_SIZE = 5
  CATEGORY_KEYS = %i[seed fertilizer chemicals labor].freeze

  def self.call(farm, cohort_farms:, season_year: CurrentSeason.year)
    new(farm, cohort_farms:, season_year:).call
  end

  def initialize(farm, cohort_farms:, season_year:)
    @farm = farm
    @cohort_farms = cohort_farms
    @season_year = season_year
  end

  def call
    peer_fields_by_commodity = build_peer_fields_index
    compared_ids = Set.new

    comparisons = @farm.fields.includes(:input_costs).map do |field|
      result = build_field_comparison(field, peer_fields_by_commodity)
      compared_ids.add(field.id) if result
      result
    end.compact

    excluded = @farm.fields.reject { |f| compared_ids.include?(f.id) }.map do |field|
      {
        field_id: field.id,
        field_name: field.name,
        primary_commodity: field.primary_commodity,
        acres: field.acres.to_f,
        categories: {},
        excluded_reason: "no_cost_data"
      }
    end

    comparisons + excluded
  end

  private

  def build_peer_fields_index
    index = Hash.new { |h, k| h[k] = [] }

    @cohort_farms.each do |farm|
      farm.fields.each do |field|
        index[field.primary_commodity] << field
      end
    end

    index
  end

  def build_field_comparison(field, peer_fields_by_commodity)
    user_costs = field_costs(field)
    return nil unless user_costs.values.any?(&:positive?)

    peer_fields = peer_fields_by_commodity[field.primary_commodity] || []
    return nil if peer_fields.size < MIN_FIELD_COHORT_SIZE

    peer_medians = {}
    categories = {}

    CATEGORY_KEYS.each do |key|
      values = peer_fields.filter_map { |peer_field| field_costs(peer_field)[key] }.select(&:positive?)
      next if values.empty?

      median = PercentileRank.median(values)
      peer_medians[key] = median
      user_value = user_costs[key]
      diff = (user_value - median.to_f).round(2)
      categories[key.to_s] = {
        user_per_acre: user_value,
        peer_median_per_acre: median,
        difference_vs_peer_per_acre: diff,
        peer_percentile: PercentileRank.call(user_value, values),
        flag_vs_peer: PeerComparisonFlags.flag_for(diff, median)
      }
    end

    return nil if categories.empty?

    {
      field_id: field.id,
      field_name: field.name,
      primary_commodity: field.primary_commodity,
      acres: field.acres.to_f,
      user_costs_per_acre: user_costs.transform_keys(&:to_s),
      peer_median_per_acre: peer_medians.transform_keys(&:to_s),
      peer_cohort_size: peer_fields.size,
      categories: categories
    }
  end

  def field_costs(field)
    totals = CATEGORY_KEYS.index_with { 0.0 }
    field.input_costs.where(season_year: @season_year).find_each do |cost|
      key = cost.category.to_sym
      totals[key] = cost.amount_per_acre.to_f if totals.key?(key)
    end
    totals.transform_values { |v| v.round(2) }
  end
end
