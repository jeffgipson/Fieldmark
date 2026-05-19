# frozen_string_literal: true

class UserVendorContact < ApplicationRecord
  belongs_to :user
  belongs_to :vendor

  validates :user_id, uniqueness: { scope: :vendor_id }
end
