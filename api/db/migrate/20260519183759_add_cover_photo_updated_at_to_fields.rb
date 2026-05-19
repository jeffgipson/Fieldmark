class AddCoverPhotoUpdatedAtToFields < ActiveRecord::Migration[8.1]
  def change
    add_column :fields, :cover_photo_updated_at, :datetime
  end
end
