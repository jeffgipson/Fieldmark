# frozen_string_literal: true

class AddLocationToFarmsAndFields < ActiveRecord::Migration[8.1]
  def change
    %i[farms fields].each do |table|
      change_table table, bulk: true do |t|
        t.decimal :latitude, precision: 10, scale: 7
        t.decimal :longitude, precision: 10, scale: 7
        t.jsonb :boundary, default: nil
        t.jsonb :location_meta, default: {}, null: false
      end
    end

    add_index :farms, %i[latitude longitude], name: "index_farms_on_coordinates"
    add_index :fields, %i[latitude longitude], name: "index_fields_on_coordinates"
  end
end
