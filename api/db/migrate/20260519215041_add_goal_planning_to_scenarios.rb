# frozen_string_literal: true

class AddGoalPlanningToScenarios < ActiveRecord::Migration[8.1]
  def change
    add_column :scenarios, :planning_mode, :integer, null: false, default: 0
    add_column :scenarios, :target_total_margin, :decimal, precision: 12, scale: 2
    add_column :scenarios, :target_margin_per_acre, :decimal, precision: 10, scale: 2
    add_index :scenarios, :planning_mode
  end
end
