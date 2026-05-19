# frozen_string_literal: true

class AddProjectionYearsToScenarios < ActiveRecord::Migration[8.1]
  def change
    add_column :scenarios, :projection_years, :jsonb, null: false, default: []
  end
end
