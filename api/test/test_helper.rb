ENV["RAILS_ENV"] ||= "test"

# Rails applies DATABASE_URL to every environment. dotenv often sets it to
# fieldmark_development, and DatabaseCleaner :truncation then wipes dev data.
unless ENV["TEST_DATABASE_URL"].present?
  url = ENV["DATABASE_URL"].to_s
  if url.present? && !url.include?("_test")
    warn "[test] Ignoring DATABASE_URL for test (use fieldmark_test from database.yml)."
    ENV.delete("DATABASE_URL")
  end
end

require_relative "../config/environment"
require "rails/test_help"
require "database_cleaner/active_record"
require_relative "support/api_test_helpers"

test_db = ActiveRecord::Base.connection_db_config.database.to_s
unless test_db.end_with?("_test")
  abort <<~MSG

    ABORT: Tests are connected to "#{test_db}", not a *_test database.
    DatabaseCleaner will truncate every table and wipe your dev data.

    Fix: remove DATABASE_URL from api/.env (database.yml is enough locally),
    or set TEST_DATABASE_URL to postgres://localhost/fieldmark_test

  MSG
end

class ActiveSupport::TestCase
  parallelize(workers: :number_of_processors)

  DatabaseCleaner.strategy = :truncation
  self.use_transactional_tests = false

  setup do
    DatabaseCleaner.start
    MacroDriversSeed.call
  end

  teardown do
    DatabaseCleaner.clean
  end

  include ApiTestHelpers
end
