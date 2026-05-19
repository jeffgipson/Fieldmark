# frozen_string_literal: true

module BenchmarkData
  class Validator
    TOLERANCE = 0.10

    def self.call(record)
      new(record).call
    end

    def initialize(record)
      @record = record
      @costs = record["costs_per_acre"]
    end

    def call
      errors = []
      errors << "Missing costs_per_acre" unless @costs
      return errors if errors.any?

      errors.concat(validate_required_fields)
      errors.concat(validate_sums)
      errors
    end

    private

    def validate_required_fields
      required = %w[source url commodity irrigation season_year assumed_yield_bu_per_acre assumed_price_per_bu]
      required.filter_map { |field| "Missing #{field}" if @record[field].blank? }
    end

    def validate_sums
      errors = []
      op_sum = sum_keys(@costs, %w[seed fertilizer chemicals labor custom_hire drying supplies_storage_marketing consulting_insurance machinery_fuel machinery_repairs management operating_interest])
      own_sum = sum_keys(@costs, %w[farm_overhead machinery_ownership real_estate])

      if (op_sum - @costs["total_operating"]).abs > TOLERANCE
        errors << "Operating costs do not sum to total_operating (is: #{op_sum}, expected: #{@costs["total_operating"]})"
      end

      if (@costs["total_operating"] + own_sum - @costs["total_costs"]).abs > TOLERANCE
        errors << "Total operating + ownership do not sum to total_costs"
      end

      errors
    end

    def sum_keys(h, keys)
      keys.sum { |k| h[k].to_f }
    end
  end
end
