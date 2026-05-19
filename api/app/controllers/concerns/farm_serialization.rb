# frozen_string_literal: true

module FarmSerialization
  extend ActiveSupport::Concern

  private

  def farm_json(farm)
    json = farm.as_json(only: %i[
      id name total_acres county region primary_commodity
      latitude longitude location_meta cover_photo_updated_at
      created_at updated_at
    ])
    if FarmCoverPhotoStore.attached?(farm.id)
      json["cover_photo_path"] = api_v1_farm_cover_photo_path(
        farm.id,
        t: farm.cover_photo_updated_at&.to_i
      )
    end
    json
  end
end
