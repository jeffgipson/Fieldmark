# frozen_string_literal: true

class CreateFarmSeasonSnapshots < ActiveRecord::Migration[8.1]
  def change
    create_table :farm_season_snapshots do |t|
      t.references :farm, null: false, foreign_key: true
      t.integer :season_year, null: false
      t.decimal :actual_yield, precision: 8, scale: 2
      t.decimal :actual_price, precision: 8, scale: 4
      t.decimal :actual_total_operating_per_acre, precision: 10, scale: 2
      t.text :notes
      t.integer :source, null: false, default: 0

      t.timestamps
    end

    add_index :farm_season_snapshots, %i[farm_id season_year], unique: true
    add_index :farm_season_snapshots, :season_year
  end
end
