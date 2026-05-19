# frozen_string_literal: true

module Api
  module V1
    class FarmCoverPhotosController < BaseController
      include FarmSerialization

      before_action :set_farm

      def show
        unless FarmCoverPhotoStore.attached?(@farm.id)
          return render_errors([{ field: "cover_photo", message: "No cover photo" }], status: :not_found)
        end

        send_file(
          FarmCoverPhotoStore.path_for(@farm.id),
          type: "image/jpeg",
          disposition: "inline",
          filename: "farm-#{@farm.id}-cover.jpg"
        )
      end

      def update
        file = params[:cover_photo]
        unless file.respond_to?(:read)
          return render_errors(
            [{ field: "cover_photo", message: "Cover photo file is required" }],
            status: :unprocessable_entity
          )
        end

        FarmCoverPhotoStore.write!(@farm.id, file, content_type: file.content_type)
        @farm.update!(cover_photo_updated_at: Time.current)
        render_success(farm_json(@farm))
      rescue ArgumentError => e
        render_errors([{ field: "cover_photo", message: e.message }], status: :unprocessable_entity)
      end

      def destroy
        FarmCoverPhotoStore.delete!(@farm.id)
        @farm.update!(cover_photo_updated_at: nil)
        render_success(farm_json(@farm))
      end

      private

      def set_farm
        @farm = find_farm!(params[:farm_id])
      end
    end
  end
end
