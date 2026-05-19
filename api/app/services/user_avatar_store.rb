# frozen_string_literal: true

# Stores user avatar images on disk (api-only friendly; no Active Storage routes).
class UserAvatarStore
  AVATAR_DIR = Rails.root.join("storage/user_avatars").freeze
  MAX_BYTES = 2 * 1024 * 1024
  ALLOWED_TYPES = %w[image/jpeg image/png image/webp].freeze

  class << self
    def path_for(user_id)
      AVATAR_DIR.join("#{user_id}.jpg")
    end

    def attached?(user_id)
      path_for(user_id).file?
    end

    def write!(user_id, uploaded_io, content_type:)
      type = content_type.to_s.downcase.split(";").first.strip
      unless ALLOWED_TYPES.include?(type)
        raise ArgumentError, "Avatar must be a JPEG, PNG, or WebP image"
      end

      bytes = uploaded_io.read
      raise ArgumentError, "Avatar is empty" if bytes.blank?
      raise ArgumentError, "Avatar must be 2 MB or smaller" if bytes.bytesize > MAX_BYTES

      AVATAR_DIR.mkpath
      File.binwrite(path_for(user_id), bytes)
    end

    def delete!(user_id)
      FileUtils.rm_f(path_for(user_id))
    end
  end
end
