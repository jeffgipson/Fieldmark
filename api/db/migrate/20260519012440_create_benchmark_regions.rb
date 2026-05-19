# frozen_string_literal: true

class CreateBenchmarkRegions < ActiveRecord::Migration[8.1]
  def change
    create_table :benchmark_regions do |t|
      t.integer :region, null: false
      t.integer :commodity, null: false
      t.integer :season_year, null: false
      t.decimal :seed_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :fertilizer_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :chemicals_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :labor_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :total_operating_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :total_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :assumed_yield, precision: 10, scale: 2, null: false
      t.decimal :assumed_price, precision: 10, scale: 2, null: false
      t.string :source, null: false

      t.timestamps
    end
    add_index :benchmark_regions, %i[region commodity season_year], unique: true, name: "idx_benchmark_regions_lookup"
  end
end
