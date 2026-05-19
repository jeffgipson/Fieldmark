# frozen_string_literal: true

module BenchmarkData
  class PeerFarmGenerator
    COUNTIES = [
      "Boone", "Callaway", "Cole", "Cooper", "Howard", "Moniteau", "Morgan",
      "Audrain", "Monroe", "Randolph", "Shelby", "Knox", "Lewis", "Marion",
      "Pike", "Ralls", "Scotland", "Adair", "Macon", "Linn", "Chariton",
      "Saline", "Lafayette", "Jackson", "Cass", "Bates", "Vernon", "Barton",
      "Cedar", "St. Clair", "Henry", "Johnson"
    ].freeze

    def self.call
      new.call
    end

    def call
      # For now, we will just create a placeholder file.
      # a full implementation would generate 50 farms with variance.
      output_path = Rails.root.join("db", "seeds", "peer_farms.json")
      File.write(output_path, JSON.pretty_generate([]))
      puts "Wrote synthetic peer farm data to #{output_path}"
    end
  end
end
