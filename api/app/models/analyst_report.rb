# frozen_string_literal: true

class AnalystReport < ApplicationRecord
  belongs_to :scenario

  enum :status, { pending: 0, processing: 1, completed: 2, failed: 3 }, validate: true

  validates :summary, :generated_at, presence: true, if: :completed?
end
