# frozen_string_literal: true

module EnforcesSubscription
  extend ActiveSupport::Concern

  private

  def authorize_farm_creation!
    return if current_user.admin?
    return if current_user.can_create_farm?

    render_errors(
      [{
        field: "subscription",
        message: "Your Basic plan includes one farm. Upgrade to Pro ($50/mo) to add more farms."
      }],
      status: :payment_required
    )
  end

  def authorize_field_creation!
    return if current_user.admin?
    return if current_user.can_add_field?(@farm)

    render_errors(
      [{
        field: "subscription",
        message: "Your Basic plan includes up to five fields. Upgrade to Pro ($50/mo) to add more fields."
      }],
      status: :payment_required
    )
  end
end
