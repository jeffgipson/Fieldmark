# frozen_string_literal: true

module FieldSerialization
  extend ActiveSupport::Concern

  private

  def field_json(field)
    json = field.as_json(only: %i[
      id farm_id name acres soil_type primary_commodity description
      latitude longitude boundary location_meta
      cover_photo_updated_at
      created_at updated_at
    ])
    farm = field.farm
    if farm && FarmCoverPhotoStore.attached?(farm.id) && !FieldCoverPhotoStore.attached?(field.id)
      json["farm_cover_photo_path"] = api_v1_farm_cover_photo_path(
        farm.id,
        t: farm.cover_photo_updated_at&.to_i
      )
    end
    if FieldCoverPhotoStore.attached?(field.id)
      json["cover_photo_path"] = api_v1_farm_field_cover_photo_path(
        field.farm_id,
        field.id,
        t: field.cover_photo_updated_at&.to_i
      )
    end
    json
  end
end
