# frozen_string_literal: true

namespace :demo do
  desc "Seed demo user, farm, fields, costs, and scenario (see DEMO_EMAIL in .env.example)"
  task seed: :environment do
    result = DemoSeed.call
    row = result[:farmers].first
    puts "Demo ready: #{row[:email]} / #{AppConfig.demo_password}"
    puts "  Farm id=#{row[:farm].id}, Scenario id=#{row[:scenario].id}"
    puts "  Tip: bin/rails sample_data:seed for all Cape Girardeau test farmers"
  end

  desc "Reset demo data and re-seed"
  task reset: :environment do
    result = DemoSeed.call(reset: true)
    row = result[:farmers].first
    puts "Demo reset: #{row[:email]} / #{AppConfig.demo_password}"
    puts "  Farm id=#{row[:farm].id}, Scenario id=#{row[:scenario].id}"
  end
end
