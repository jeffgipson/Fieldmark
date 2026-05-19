# frozen_string_literal: true

class AddFieldNotesToDecisions < ActiveRecord::Migration[8.1]
  def change
    add_column :decisions, :field_notes, :jsonb, null: false, default: []
  end
end
