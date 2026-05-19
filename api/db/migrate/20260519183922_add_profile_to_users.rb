# frozen_string_literal: true

class AddProfileToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :bio, :text
    add_column :users, :phone, :string
    add_column :users, :avatar_updated_at, :datetime
    add_column :users, :social_links, :jsonb, null: false, default: {}
  end
end
