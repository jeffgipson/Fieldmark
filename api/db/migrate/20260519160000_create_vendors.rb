# frozen_string_literal: true

class CreateVendors < ActiveRecord::Migration[8.1]
  def change
    create_table :vendors do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :category, null: false
      t.text :description
      t.string :website
      t.string :phone
      t.string :email
      t.string :street_address
      t.string :city
      t.string :state, default: "MO", null: false
      t.integer :region
      t.jsonb :counties, default: [], null: false
      t.boolean :serves_statewide, default: false, null: false
      t.integer :listing_tier, default: 0, null: false
      t.boolean :sponsored, default: false, null: false
      t.date :featured_until
      t.boolean :active, default: true, null: false
      t.text :billing_notes
      t.integer :monthly_listing_cents

      t.timestamps
    end

    add_index :vendors, :slug, unique: true
    add_index :vendors, :category
    add_index :vendors, :listing_tier
    add_index :vendors, :active
    add_index :vendors, :counties, using: :gin
  end
end
