# frozen_string_literal: true

class CreateFarms < ActiveRecord::Migration[8.1]
  def change
    create_table :farms do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :total_acres, precision: 10, scale: 2, null: false
      t.string :county, null: false
      t.integer :region, null: false, default: 1
      t.integer :primary_commodity, null: false, default: 0

      t.timestamps
    end
    add_index :farms, :region
    add_index :farms, :primary_commodity
  end
end
