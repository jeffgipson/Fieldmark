# frozen_string_literal: true

class Decision < ApplicationRecord
  belongs_to :scenario
  belongs_to :vendor, optional: true

  enum :decision_type, { proceed: 0, wait: 1, modify: 2, cancel: 3 }
  enum :vendor_category, Vendor.categories, prefix: :vendor_category

  validates :decision_type, :decided_at, presence: true
  validate :field_notes_shape

  FIELD_STANCES = %w[proceed modify wait].freeze

  private

  def field_notes_shape
    return if field_notes.blank?

    unless field_notes.is_a?(Array)
      errors.add(:field_notes, "must be an array")
      return
    end

    field_notes.each do |row|
      unless row.is_a?(Hash) && row["field_id"].present? && FIELD_STANCES.include?(row["stance"].to_s)
        errors.add(:field_notes, "each entry needs field_id and stance (proceed, modify, wait)")
      end
    end
  end
end
