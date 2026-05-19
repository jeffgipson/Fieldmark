# frozen_string_literal: true

class MacroDriver < ApplicationRecord
  validates :season_year, :driver_key, :value, :source, :effective_on, presence: true
  validates :driver_key, uniqueness: { scope: :season_year }
end
