# frozen_string_literal: true

class CreateAnalystConversations < ActiveRecord::Migration[8.1]
  def change
    create_table :analyst_conversations do |t|
      t.references :farm, null: false, foreign_key: true
      t.references :scenario, foreign_key: true
      t.jsonb :context_snapshot, default: {}, null: false

      t.timestamps
    end
  end
end
