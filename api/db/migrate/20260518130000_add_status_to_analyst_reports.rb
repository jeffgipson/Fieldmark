# frozen_string_literal: true

class AddStatusToAnalystReports < ActiveRecord::Migration[8.1]
  def change
    add_column :analyst_reports, :status, :integer, default: 0, null: false
    add_column :analyst_reports, :error_message, :text
    add_index :analyst_reports, :status
  end
end
