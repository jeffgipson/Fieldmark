# frozen_string_literal: true

class CreateInputCosts < ActiveRecord::Migration[8.1]
  def change
    create_table :input_costs do |t|
      t.references :field, null: false, foreign_key: true
      t.integer :season_year, null: false
      t.integer :category, null: false
      t.decimal :amount_per_acre, precision: 10, scale: 2, null: false
      t.text :notes

      t.timestamps
    end
    add_index :input_costs, %i[field_id season_year category], unique: true, name: "idx_input_costs_field_season_category"
    add_index :input_costs, :season_year
    add_index :input_costs, :category
  end
end
