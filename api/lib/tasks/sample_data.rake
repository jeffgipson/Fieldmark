# frozen_string_literal: true

namespace :sample_data do
  desc "Generate db/seeds/cape_girardeau_sample.json (COUNT=100 default)"
  task generate: :environment do
    require Rails.root.join("lib/sample_data/cape_girardeau_generator")

    count = ENV.fetch("COUNT", 100).to_i
    result = SampleData::CapeGirardeauGenerator.call(count: count)
    puts "Wrote #{result[:path]}"
    puts "  #{result[:farmers]} farmers, #{result[:fields]} fields"
  end

  desc "Regenerate JSON (COUNT=100) and load into the database"
  task rebuild: %i[generate seed] do
  end

  desc "Seed Cape Girardeau County farmers, fields, costs, and scenarios (db/seeds/cape_girardeau_sample.json)"
  task seed: :environment do
    result = CapeGirardeauSampleSeed.call
    print_summary(result)
  end

  desc "Remove @cape.fieldmark.app users and re-seed all sample farmers (keeps demo@fieldmark.app)"
  task reset: :environment do
    result = CapeGirardeauSampleSeed.call(reset: true)
    print_summary(result, label: "Sample data reset")
  end

  desc "Re-seed only the demo account (DEMO_EMAIL)"
  task demo: :environment do
    result = CapeGirardeauSampleSeed.call(only_demo: true)
    print_summary(result, label: "Demo account")
  end

  def print_summary(result, label: "Sample data")
    puts "#{label}: #{result[:total_users]} farmers, #{result[:total_fields]} fields"
    puts "  Password for all accounts: #{result[:password]}"
    puts "  Demo: #{AppConfig.demo_email}"
  end
end
