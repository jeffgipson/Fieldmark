# frozen_string_literal: true

module BenchmarkData
  class CohortSeeder
    def self.call
      new.call
    end

    def call
      # For now, we will just create a placeholder.
      # a full implementation would seed the 50 farms.
      puts "Skipping cohort seeding (placeholder)."
    end
  end
end
