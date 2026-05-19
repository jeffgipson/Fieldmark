# frozen_string_literal: true

class CreateUserInvitations < ActiveRecord::Migration[8.1]
  def change
    create_table :user_invitations do |t|
      t.references :inviter, null: false, foreign_key: { to_table: :users }
      t.string :email, null: false
      t.text :message
      t.string :token, null: false
      t.integer :status, null: false, default: 0
      t.datetime :expires_at, null: false
      t.references :accepted_user, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :user_invitations, :token, unique: true
    add_index :user_invitations, %i[inviter_id email status], name: "index_user_invitations_on_inviter_email_status"
    add_index :user_invitations, :status
  end
end
