# frozen_string_literal: true

# Demo login (DEMO_EMAIL) — one Cape Girardeau farmer from cape_girardeau_sample.json.
class DemoSeed
  def self.call(reset: false)
    CapeGirardeauSampleSeed.call(reset: reset, only_demo: true)
  end
end
