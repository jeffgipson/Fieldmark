# frozen_string_literal: true

class FarmHistoryImport < ApplicationRecord
  belongs_to :farm

  enum :status, { parsing: 0, parsed: 1, applied: 2, failed: 3 }
end
