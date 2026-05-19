# frozen_string_literal: true

class AnalystConversation < ApplicationRecord
  belongs_to :farm
  belongs_to :scenario, optional: true
  has_many :analyst_messages, dependent: :destroy
end
