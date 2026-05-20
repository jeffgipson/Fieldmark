ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.

# dotenv/rails.rb can load before dotenv.rb (e.g. Hatchbox with dev gems installed),
# which raises NoMethodError on Dotenv.instrumenter=. Predefine the accessor.
if Bundler.rubygems.find_name("dotenv").any?
  module Dotenv
    class << self
      attr_accessor :instrumenter unless respond_to?(:instrumenter=)
    end
  end
end

require "bootsnap/setup" # Speed up boot time by caching expensive operations.
