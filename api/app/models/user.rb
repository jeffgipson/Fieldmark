# frozen_string_literal: true

class User < ApplicationRecord
  SOCIAL_LINK_KEYS = %w[website facebook linkedin x instagram].freeze
  BIO_MAX_LENGTH = 500

  devise :database_authenticatable, :registerable, :recoverable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  attr_accessor :skip_welcome_email

  enum :role, { farmer: 0, admin: 1 }, default: :farmer
  enum :subscription_plan, { basic: 0, pro: 1 }, default: :basic
  enum :subscription_status, { active: 0, past_due: 1, canceled: 2 }, default: :active

  has_many :farms, dependent: :destroy
  has_many :user_vendor_contacts, dependent: :destroy
  has_many :saved_vendors, through: :user_vendor_contacts, source: :vendor
  has_many :sent_invitations, class_name: "UserInvitation", foreign_key: :inviter_id, dependent: :destroy,
                              inverse_of: :inviter

  validates :first_name, :last_name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :bio, length: { maximum: BIO_MAX_LENGTH }, allow_blank: true
  validates :phone, length: { maximum: 30 }, allow_blank: true
  validate :social_links_shape

  before_validation :ensure_jti
  before_validation :normalize_social_links

  after_create_commit :enqueue_welcome_email

  def admin?
    role == "admin"
  end

  def display_name
    [first_name, last_name].compact_blank.join(" ").presence || email
  end

  def subscription_entitled?
    admin? || subscription_active?
  end

  def subscription_active?
    active?
  end

  def plan_config
    SubscriptionPlan.for(subscription_plan)
  end

  def can_create_farm?
    return true if admin?

    max = plan_config[:max_farms]
    return true if max.nil?

    farms.count < max
  end

  def can_add_field?(farm)
    return true if admin?
    return false unless farm.user_id == id

    max = plan_config[:max_fields_per_farm]
    return true if max.nil?

    farm.fields.count < max
  end

  def subscription_usage
    primary_farm = farms.order(:id).first
    fields_count = primary_farm ? primary_farm.fields.count : 0

    {
      farms_count: farms.count,
      fields_count: fields_count,
      limits: subscription_limits
    }
  end

  def subscription_limits
    config = plan_config
    {
      max_farms: config[:max_farms],
      max_fields_per_farm: config[:max_fields_per_farm]
    }
  end

  def update_profile!(attrs)
    update!(attrs.slice("first_name", "last_name", "bio", "phone", "social_links"))
  end

  def update_credentials!(current_password:, email: nil, password: nil, password_confirmation: nil)
    unless valid_password?(current_password)
      errors.add(:current_password, "is incorrect")
      return false
    end

    attrs = {}
    attrs[:email] = email if email.present?
    if password.present?
      attrs[:password] = password
      attrs[:password_confirmation] = password_confirmation.presence || password
    end

    update(attrs)
  end

  private

  def enqueue_welcome_email
    return if skip_welcome_email

    FieldmarkMailer.welcome(self).deliver_later
  end

  def ensure_jti
    self.jti ||= SecureRandom.uuid
  end

  def normalize_social_links
    return if social_links.blank?

    cleaned = social_links.stringify_keys.slice(*SOCIAL_LINK_KEYS).transform_values do |value|
      value.to_s.strip.presence
    end.compact
    self.social_links = cleaned
  end

  def social_links_shape
    return if social_links.blank?
    return if social_links.is_a?(Hash) && social_links.keys.all? { |k| SOCIAL_LINK_KEYS.include?(k.to_s) }

    errors.add(:social_links, "contains unsupported keys")
  end
end
