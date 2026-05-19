# frozen_string_literal: true

class CreateFarmPriorities < ActiveRecord::Migration[8.1]
  def change
    create_table :farm_priorities do |t|
      t.references :farm, null: false, foreign_key: true
      t.integer :category, null: false, default: 0
      t.text :note
      t.integer :season_year, null: false
      t.integer :status, null: false, default: 0
      t.integer :source, null: false, default: 0
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :farm_priorities, %i[farm_id season_year status]
    add_index :farm_priorities, %i[farm_id season_year position]
    add_index :farm_priorities, :category
  end
end
