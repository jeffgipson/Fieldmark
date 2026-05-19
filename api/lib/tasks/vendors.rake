# frozen_string_literal: true

namespace :vendors do
  desc "Seed vendor directory from db/seeds/vendors_cape_girardeau.json"
  task seed: :environment do
    result = VendorSeed.call
    puts "Vendors seeded: #{result[:count]}"
  end
end

namespace :admin do
  desc "Create or update admin user (ADMIN_EMAIL / ADMIN_PASSWORD)"
  task seed: :environment do
    user = AdminSeed.call
    puts "Admin ready: #{user.email} / #{ENV.fetch('ADMIN_PASSWORD', AppConfig.demo_password)}"
  end
end
