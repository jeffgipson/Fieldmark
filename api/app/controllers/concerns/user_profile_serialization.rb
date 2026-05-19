# frozen_string_literal: true

module UserProfileSerialization
  extend ActiveSupport::Concern
  include SubscriptionSerialization

  private

  def profile_json(user)
    json = user.as_json(
      only: %i[id email first_name last_name role bio phone social_links created_at updated_at]
    )
    if UserAvatarStore.attached?(user.id)
      json["avatar_path"] = api_v1_avatar_path(t: user.avatar_updated_at&.to_i)
    end
    json.merge("subscription" => subscription_json(user))
  end

  def invitation_json(invitation)
    invitation.as_json(only: %i[id email message status expires_at created_at]).merge(
      invite_url: invitation.invite_url
    )
  end
end
