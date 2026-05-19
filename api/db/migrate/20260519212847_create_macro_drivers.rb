# frozen_string_literal: true

class CreateMacroDrivers < ActiveRecord::Migration[8.1]
  def change
    create_table :macro_drivers do |t|
      t.integer :season_year, null: false
      t.string :driver_key, null: false
      t.decimal :value, null: false, precision: 12, scale: 4
      t.string :source, null: false
      t.string :source_url
      t.date :effective_on, null: false

      t.timestamps
    end

    add_index :macro_drivers, %i[season_year driver_key], unique: true
  end
end
