# frozen_string_literal: true

class CreateFields < ActiveRecord::Migration[8.1]
  def change
    create_table :fields do |t|
      t.references :farm, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :acres, precision: 10, scale: 2, null: false
      t.string :soil_type, null: false
      t.integer :primary_commodity, null: false, default: 0

      t.timestamps
    end
    add_index :fields, :primary_commodity
  end
end
