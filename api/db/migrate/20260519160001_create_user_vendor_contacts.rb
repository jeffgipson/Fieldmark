# frozen_string_literal: true

class CreateUserVendorContacts < ActiveRecord::Migration[8.1]
  def change
    create_table :user_vendor_contacts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :vendor, null: false, foreign_key: true
      t.text :notes
      t.datetime :last_contacted_at

      t.timestamps
    end

    add_index :user_vendor_contacts, %i[user_id vendor_id], unique: true
  end
end
