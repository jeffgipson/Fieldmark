# frozen_string_literal: true

class RegionalRiskContextService
  # Static demo context — not live weather forecasts. Sources cited for Dale and UI.
  FLAGS = {
    "northern" => {
      message: "Northern Missouri entered spring with mixed soil moisture — review downside yield if planting into dry topsoil.",
      source: "USDA Missouri Crop Progress",
      source_url: "https://www.nass.usda.gov/Statistics_by_State/Missouri/Publications/Crop_Progress/"
    },
    "central" => {
      message: "Central Missouri conditions are near normal for late winter — still worth stress-testing yield below your five-year average.",
      source: "USDA Missouri Crop Progress",
      source_url: "https://www.nass.usda.gov/Statistics_by_State/Missouri/Publications/Crop_Progress/"
    },
    "southwest" => {
      message: "Southwest Missouri has seen more drought stress in recent seasons — benchmarks assume average weather, not a dry year.",
      source: "USDA U.S. Drought Monitor",
      source_url: "https://droughtmonitor.unl.edu/"
    }
  }.freeze

  def self.call(farm)
    new(farm).call
  end

  def initialize(farm)
    @farm = farm
  end

  def call
    region = @farm.region.to_s
    flag = FLAGS[region] || FLAGS["central"]

    {
      region: region,
      message: flag[:message],
      source: flag[:source],
      source_url: flag[:source_url],
      note: "Regional risk context only — does not change your scenario automatically. Adjust downside yield if this applies to your fields."
    }
  end
end
