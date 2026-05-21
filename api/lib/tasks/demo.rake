# frozen_string_literal: true

namespace :demo do
  desc "Seed demo user, farm, fields, costs, and scenario (see DEMO_EMAIL in .env.example)"
  task seed: :environment do
    result = DemoSeed.call
    row = result[:farmers].first
    vendor_result = VendorSeed.call
    puts "Demo ready: #{row[:email]} / #{AppConfig.demo_password}"
    puts "  Farm id=#{row[:farm].id}, Scenario id=#{row[:scenario].id}"
    puts "  Vendors seeded: #{vendor_result[:count]} (#{vendor_result[:active]} active)"
    puts "  Tip: bin/rails sample_data:seed for all Cape Girardeau test farmers"
  end

  desc "Reset demo data and re-seed"
  task reset: :environment do
    result = DemoSeed.call(reset: true)
    row = result[:farmers].first
    vendor_result = VendorSeed.call
    puts "Demo reset: #{row[:email]} / #{AppConfig.demo_password}"
    puts "  Farm id=#{row[:farm].id}, Scenario id=#{row[:scenario].id}"
    puts "  Vendors seeded: #{vendor_result[:count]} (#{vendor_result[:active]} active)"
  end
end
