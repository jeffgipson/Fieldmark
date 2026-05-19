# frozen_string_literal: true

class CreateScenarios < ActiveRecord::Migration[8.1]
  def change
    create_table :scenarios do |t|
      t.references :farm, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :commodity_price, precision: 10, scale: 4
      t.decimal :yield_assumption, precision: 10, scale: 2
      t.decimal :downside_commodity_price, precision: 10, scale: 4
      t.decimal :downside_yield, precision: 10, scale: 2
      t.jsonb :results, default: {}, null: false

      t.timestamps
    end
  end
end
