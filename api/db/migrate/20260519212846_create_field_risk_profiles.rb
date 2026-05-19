# frozen_string_literal: true

class CreateFieldRiskProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :field_risk_profiles do |t|
      t.references :field, null: false, foreign_key: true, index: { unique: true }
      t.integer :flood_events_last_5_years
      t.integer :drainage, null: false, default: 1
      t.boolean :bottomland, null: false, default: false
      t.text :risk_notes

      t.timestamps
    end

    add_index :field_risk_profiles, :drainage
  end
end
