# frozen_string_literal: true

class AnalystMessage < ApplicationRecord
  belongs_to :analyst_conversation

  enum :role, { user: 0, assistant: 1 }

  validates :role, :content, presence: true
end
