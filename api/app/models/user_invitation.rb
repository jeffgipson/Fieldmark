# frozen_string_literal: true

class UserInvitation < ApplicationRecord
  INVITE_TTL = 14.days

  belongs_to :inviter, class_name: "User"
  belongs_to :accepted_user, class_name: "User", optional: true

  enum :status, { pending: 0, accepted: 1, expired: 2, revoked: 3 }, default: :pending

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true
  validate :email_not_self
  validate :email_not_existing_user, on: :create
  validate :no_duplicate_pending_invite, on: :create

  before_validation :assign_token, on: :create
  before_validation :assign_expiry, on: :create

  scope :active, -> { pending.where("expires_at > ?", Time.current) }

  def expired?
    pending? && expires_at <= Time.current
  end

  def mark_expired_if_needed!
    update!(status: :expired) if expired?
  end

  def accept!(user)
    update!(status: :accepted, accepted_user: user)
  end

  def invite_url
    base = AppConfig.frontend_url.chomp("/")
    "#{base}/register?invite=#{token}"
  end

  private

  def assign_token
    self.token ||= SecureRandom.urlsafe_base64(24)
  end

  def assign_expiry
    self.expires_at ||= INVITE_TTL.from_now
  end

  def email_not_self
    return if inviter.blank? || email.blank?

    errors.add(:email, "cannot invite yourself") if email.downcase == inviter.email.downcase
  end

  def email_not_existing_user
    return if email.blank?

    errors.add(:email, "already has a Fieldmark account") if User.exists?(["LOWER(email) = ?", email.downcase])
  end

  def no_duplicate_pending_invite
    return if inviter.blank? || email.blank?

    duplicate = inviter.sent_invitations.pending.exists?(["LOWER(email) = ?", email.downcase])
    errors.add(:email, "already has a pending invitation") if duplicate
  end
end
