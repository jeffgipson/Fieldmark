# frozen_string_literal: true

module Api
  module V1
    class FieldCoverPhotosController < BaseController
      include FieldSerialization

      before_action :set_farm
      before_action :set_field

      def show
        unless FieldCoverPhotoStore.attached?(@field.id)
          return render_errors([{ field: "cover_photo", message: "No cover photo" }], status: :not_found)
        end

        send_file(
          FieldCoverPhotoStore.path_for(@field.id),
          type: "image/jpeg",
          disposition: "inline",
          filename: "field-#{@field.id}-cover.jpg"
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

        FieldCoverPhotoStore.write!(@field.id, file, content_type: file.content_type)
        @field.update!(cover_photo_updated_at: Time.current)
        render_success(field_json(@field))
      rescue ArgumentError => e
        render_errors([{ field: "cover_photo", message: e.message }], status: :unprocessable_entity)
      end

      def destroy
        FieldCoverPhotoStore.delete!(@field.id)
        @field.update!(cover_photo_updated_at: nil)
        render_success(field_json(@field))
      end

      private

      def set_farm
        @farm = find_farm!
      end

      def set_field
        @field = @farm.fields.find(params[:field_id])
      end
    end
  end
end
