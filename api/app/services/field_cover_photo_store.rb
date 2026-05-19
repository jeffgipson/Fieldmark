# frozen_string_literal: true

# Stores field cover images on disk (api-only friendly; no Active Storage routes).
class FieldCoverPhotoStore
  COVER_DIR = Rails.root.join("storage/field_covers").freeze
  MAX_BYTES = 5 * 1024 * 1024
  ALLOWED_TYPES = %w[image/jpeg image/png image/webp image/heic image/heif].freeze

  class << self
    def path_for(field_id)
      COVER_DIR.join("#{field_id}.jpg")
    end

    def attached?(field_id)
      path_for(field_id).file?
    end

    def write!(field_id, uploaded_io, content_type:)
      type = content_type.to_s.downcase.split(";").first.strip
      unless ALLOWED_TYPES.include?(type)
        raise ArgumentError, "Cover photo must be a JPEG, PNG, or WebP image"
      end

      bytes = uploaded_io.read
      raise ArgumentError, "Cover photo is empty" if bytes.blank?
      raise ArgumentError, "Cover photo must be 5 MB or smaller" if bytes.bytesize > MAX_BYTES

      COVER_DIR.mkpath
      File.binwrite(path_for(field_id), bytes)
    end

    def delete!(field_id)
      FileUtils.rm_f(path_for(field_id))
    end
  end
end
