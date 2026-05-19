class CreateAnalystReports < ActiveRecord::Migration[8.1]
  def change
    create_table :analyst_reports do |t|
      t.references :scenario, null: false, foreign_key: true, index: { unique: true }
      t.text :summary
      t.jsonb :key_findings, default: []
      t.jsonb :recommendations, default: []
      t.jsonb :risk_flags, default: []
      t.text :lender_narrative
      t.datetime :generated_at

      t.timestamps
    end
  end
end
