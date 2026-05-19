# frozen_string_literal: true

module Api
  module V1
    class UserAvatarsController < BaseController
      include UserProfileSerialization

      def show
        unless UserAvatarStore.attached?(current_user.id)
          return render_errors([{ field: "avatar", message: "No avatar" }], status: :not_found)
        end

        send_file(
          UserAvatarStore.path_for(current_user.id),
          type: "image/jpeg",
          disposition: "inline",
          filename: "user-#{current_user.id}-avatar.jpg"
        )
      end

      def update
        file = params[:avatar]
        unless file.respond_to?(:read)
          return render_errors(
            [{ field: "avatar", message: "Avatar file is required" }],
            status: :unprocessable_entity
          )
        end

        UserAvatarStore.write!(current_user.id, file, content_type: file.content_type)
        current_user.update!(avatar_updated_at: Time.current)
        render_success(profile_json(current_user))
      rescue ArgumentError => e
        render_errors([{ field: "avatar", message: e.message }], status: :unprocessable_entity)
      end

      def destroy
        UserAvatarStore.delete!(current_user.id)
        current_user.update!(avatar_updated_at: nil)
        render_success(profile_json(current_user))
      end
    end
  end
end
