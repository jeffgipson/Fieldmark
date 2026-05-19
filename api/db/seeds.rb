# frozen_string_literal: true

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding benchmark data..."
BenchmarkData::Importer.call

puts "Seeding macro drivers..."
MacroDriversSeed.call

if File.exist?(Rails.root.join("db", "seeds", "peer_farms.json"))
   BenchmarkData::CohortSeeder.call
end

if Rails.env.development?
  skip_sample = ENV["SKIP_CAPE_SAMPLE"] == "1"
  if skip_sample
    puts "Seeding demo account only (SKIP_CAPE_SAMPLE=1)..."
    CapeGirardeauSampleSeed.call(only_demo: true)
  else
    puts "Seeding Cape Girardeau sample farmers..."
    result = CapeGirardeauSampleSeed.call
    puts "  #{result[:total_users]} farmers, #{result[:total_fields]} fields"
    puts "  Demo login: #{AppConfig.demo_email} / #{AppConfig.demo_password}"
    puts "  Other logins: *#{CapeGirardeauSampleSeed::CAPE_EMAIL_SUFFIX} (same password)"
  end
end

puts "Seeding vendors..."
VendorSeed.call
puts "Seeding admin..."
Rake::Task["admin:seed"].invoke

puts "Seed complete."
