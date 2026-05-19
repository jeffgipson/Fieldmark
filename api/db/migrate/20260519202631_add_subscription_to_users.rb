# frozen_string_literal: true

class AddSubscriptionToUsers < ActiveRecord::Migration[8.0]
  def change
    change_table :users, bulk: true do |t|
      t.integer :subscription_plan, null: false, default: 0
      t.integer :subscription_status, null: false, default: 0
      t.string :stripe_customer_id
      t.string :stripe_subscription_id
      t.datetime :subscription_current_period_end
    end

    add_index :users, :subscription_plan
    add_index :users, :subscription_status
    add_index :users, :stripe_customer_id, unique: true, where: "stripe_customer_id IS NOT NULL"
  end
end
