class CreatePeerComparisons < ActiveRecord::Migration[8.1]
  def change
    create_table :peer_comparisons do |t|
      t.references :scenario, null: false, foreign_key: true, index: { unique: true }
      t.references :benchmark_region, null: false, foreign_key: true
      t.decimal :seed_percentile
      t.decimal :fertilizer_percentile
      t.decimal :chemicals_percentile
      t.decimal :total_cost_percentile
      t.jsonb :summary, default: {}, null: false

      t.timestamps
    end
  end
end
