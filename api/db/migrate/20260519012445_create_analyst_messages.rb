class CreateAnalystMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :analyst_messages do |t|
      t.references :analyst_conversation, null: false, foreign_key: true
      t.integer :role, null: false
      t.text :content, null: false
      t.integer :token_count

      t.timestamps
    end

    add_index :analyst_messages, :role
  end
end
