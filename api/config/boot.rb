ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

# Hatchbox writes app env to shared/.hatchbox.env; deploy rake does not always export it.
hatchbox_env = File.expand_path("../../../shared/.hatchbox.env", __dir__)
if File.exist?(hatchbox_env)
  File.foreach(hatchbox_env) do |line|
    line = line.strip
    next if line.empty? || line.start_with?("#")

    key, value = line.split("=", 2)
    next if key.nil? || value.nil?

    value = value.strip
    value = value[1..-2] if (value.start_with?('"') && value.end_with?('"')) ||
                              (value.start_with?("'") && value.end_with?("'"))
    ENV[key.strip] ||= value
  end

  ENV["RAILS_ENV"] = "production" if ENV["RAILS_ENV"].to_s.empty?
end

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
