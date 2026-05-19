# frozen_string_literal: true

class PeerComparison < ApplicationRecord
  belongs_to :scenario
  belongs_to :benchmark_region
end
