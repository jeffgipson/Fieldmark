class ExtendBenchmarksAndFarmsForCohort < ActiveRecord::Migration[8.1]
  def change
    # Add columns to benchmark_regions
    add_column :benchmark_regions, :irrigation, :string, default: "dryland", null: false
    add_column :benchmark_regions, :source_url, :string
    add_column :benchmark_regions, :retrieved_on, :date
    add_column :benchmark_regions, :detail, :jsonb, default: {},
    null: false

    # The old index is no longer descriptive enough
    remove_index :benchmark_regions, name: "idx_benchmark_regions_lookup"

    # Re-create a more descriptive and complete unique index
    add_index :benchmark_regions, 
              [:region, :commodity, :season_year, :irrigation], 
              unique: true, 
              name: "idx_benchmark_regions_on_region_commodity_season_irrigation"

    # Add benchmark_cohort flag to farms
    add_column :farms, :benchmark_cohort, :boolean, default: false, null: false
    add_index :farms, :benchmark_cohort
  end
end
