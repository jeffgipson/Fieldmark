class AddFieldDescriptionAndFarmCoverPhoto < ActiveRecord::Migration[8.1]
  def change
    add_column :fields, :description, :text
    add_column :farms, :cover_photo_updated_at, :datetime
  end
end
