# frozen_string_literal: true

class VendorGeocoder
  def self.apply!(vendor, sleep_seconds: 1.1)
    new(vendor, sleep_seconds:).apply!
  end

  def initialize(vendor, sleep_seconds: 1.1)
    @vendor = vendor
    @sleep_seconds = sleep_seconds
  end

  def apply!
    return @vendor if @vendor.latitude.present? && @vendor.longitude.present?
    return @vendor if @vendor.full_address.blank?

    sleep(@sleep_seconds) if @sleep_seconds.positive?
    results = Location::SearchService.call(query: @vendor.full_address, limit: 1)
    hit = results.first
    return @vendor unless hit

    @vendor.latitude = hit[:latitude]
    @vendor.longitude = hit[:longitude]
    @vendor
  end
end
