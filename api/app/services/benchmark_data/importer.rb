# frozen_string_literal: true

module BenchmarkData
  class Importer
    def self.call
      new.call
    end

    def call
      json_path = Rails.root.join("db", "seeds", "benchmark_data.json")
      return unless File.exist?(json_path)

      data = JSON.parse(File.read(json_path))
      imported = 0
      data.each do |record|
        errors = Validator.call(record)
        if errors.any?
          puts "Skipping invalid record for #{record["source"]}: #{errors.join(", ")}"
          next
        end
        imported += import_record(record)
      end
      puts "Imported #{imported} benchmark regions."
    end

    private

    def import_record(record)
      costs = record["costs_per_acre"]

      record["regions"].map do |region|
        BenchmarkRegion.find_or_create_by!(
          region: region,
          commodity: record["commodity"],
          season_year: record["season_year"],
          irrigation: record["irrigation"]
        ) do |benchmark|
          benchmark.assign_attributes(
            source: record["source"],
            source_url: record["url"],
            retrieved_on: record["retrieved_date"],
            assumed_yield: record["assumed_yield_bu_per_acre"],
            assumed_price: record["assumed_price_per_bu"],
            seed_cost_per_acre: costs["seed"],
            fertilizer_cost_per_acre: costs["fertilizer"],
            chemicals_cost_per_acre: costs["chemicals"],
            labor_cost_per_acre: costs["labor"],
            total_operating_cost_per_acre: costs["total_operating"],
            total_cost_per_acre: costs["total_costs"],
            detail: record
          )
        end
      end.size
    end
  end
end
