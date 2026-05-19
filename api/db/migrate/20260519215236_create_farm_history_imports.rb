# frozen_string_literal: true

class CreateFarmHistoryImports < ActiveRecord::Migration[8.1]
  def change
    create_table :farm_history_imports do |t|
      t.references :farm, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.string :filename
      t.text :raw_csv
      t.jsonb :parsed_payload, default: {}, null: false
      t.jsonb :applied_result, default: {}, null: false
      t.text :error_message

      t.timestamps
    end

    add_index :farm_history_imports, %i[farm_id created_at]
  end
end
