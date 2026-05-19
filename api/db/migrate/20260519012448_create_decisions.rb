# frozen_string_literal: true

class CreateDecisions < ActiveRecord::Migration[8.1]
  def change
    create_table :decisions do |t|
      t.references :scenario, null: false, foreign_key: true, index: { unique: true }
      t.integer :decision_type, null: false
      t.text :notes
      t.datetime :decided_at, null: false
      t.text :actual_outcome

      t.timestamps
    end
    add_index :decisions, :decision_type
  end
end
