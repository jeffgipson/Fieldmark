# frozen_string_literal: true

class AddVendorFieldsToDecisions < ActiveRecord::Migration[8.1]
  def change
    add_reference :decisions, :vendor, foreign_key: true, null: true
    add_column :decisions, :vendor_category, :integer
    add_column :decisions, :vendor_contact_notes, :text

    add_index :decisions, :vendor_category
  end
end
