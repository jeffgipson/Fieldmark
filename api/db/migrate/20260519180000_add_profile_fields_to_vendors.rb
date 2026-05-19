# frozen_string_literal: true

class AddProfileFieldsToVendors < ActiveRecord::Migration[8.1]
  def change
    change_table :vendors, bulk: true do |t|
      t.text :profile_summary
      t.jsonb :offerings, null: false, default: []
      t.decimal :latitude, precision: 10, scale: 7
      t.decimal :longitude, precision: 10, scale: 7
    end

    add_index :vendors, %i[latitude longitude]
  end
end
