# frozen_string_literal: true

class FarmHistoryCsvApplyService
  def self.call(farm, parsed:)
    new(farm, parsed:).call
  end

  def initialize(farm, parsed:)
    @farm = farm
    @parsed = parsed.with_indifferent_access
    @fields_by_name = @farm.fields.index_by { |f| normalize_name(f.name) }
  end

  def call
    seasons_applied = 0
    costs_applied = 0
    snapshots = []
    warnings = Array(@parsed[:warnings]).dup

    Array(@parsed[:seasons]).each do |season_row|
      row = season_row.with_indifferent_access
      year = row[:season_year]
      next if year.blank?

      field_costs = Array(row[:field_costs])
      operating = row[:actual_total_operating_per_acre]
      operating ||= weighted_operating_from_costs(field_costs, warnings, year)

      snapshot = @farm.farm_season_snapshots.find_or_initialize_by(season_year: year)
      snapshot.assign_attributes(
        actual_yield: row[:actual_yield],
        actual_price: row[:actual_price],
        actual_total_operating_per_acre: operating,
        notes: append_import_note(snapshot.notes, row[:notes]),
        source: :import
      )
      if snapshot.save
        seasons_applied += 1
        snapshots << snapshot
      else
        warnings << "Season #{year}: #{snapshot.errors.full_messages.to_sentence}"
      end

      field_costs.each do |cost_row|
        cost_row = cost_row.with_indifferent_access
        field = match_field(cost_row[:field_name])
        unless field
          warnings << "No field match for '#{cost_row[:field_name]}' (#{year} #{cost_row[:category]})"
          next
        end

        category = cost_row[:category]
        next unless InputCost.categories.key?(category.to_s)

        record = field.input_costs.find_or_initialize_by(season_year: year, category: category)
        record.amount_per_acre = cost_row[:amount_per_acre]
        record.notes = "Imported from CSV"
        if record.save
          costs_applied += 1
        else
          warnings << "#{field.name} #{year} #{category}: #{record.errors.full_messages.to_sentence}"
        end
      end
    end

    {
      summary: @parsed[:summary],
      seasons_applied: seasons_applied,
      costs_applied: costs_applied,
      snapshots: snapshots.map { |s| snapshot_json(s) },
      warnings: warnings.uniq
    }
  end

  private

  def match_field(name)
    return nil if name.blank?

    key = normalize_name(name)
    @fields_by_name[key] || @farm.fields.find { |f| normalize_name(f.name).include?(key) || key.include?(normalize_name(f.name)) }
  end

  def normalize_name(name)
    name.to_s.downcase.gsub(/[^a-z0-9]+/, " ").squish
  end

  def weighted_operating_from_costs(field_costs, warnings, year)
    rows = field_costs.filter_map do |cost_row|
      cost_row = cost_row.with_indifferent_access
      field = match_field(cost_row[:field_name])
      next unless field

      { acres: field.acres.to_f, amount: cost_row[:amount_per_acre].to_f }
    end
    return nil if rows.empty?

    total_acres = rows.sum { |r| r[:acres] }
    return nil if total_acres.zero?

    (rows.sum { |r| r[:amount] * r[:acres] } / total_acres).round(2)
  end

  def append_import_note(existing, incoming)
    parts = [existing, incoming, "Imported via CSV #{Time.current.to_date}"].compact_blank
    parts.join(" · ")
  end

  def snapshot_json(snapshot)
    snapshot.as_json(only: %i[
      id farm_id season_year actual_yield actual_price actual_total_operating_per_acre notes source
    ])
  end
end
