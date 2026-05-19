# frozen_string_literal: true

class Rack::Attack
  throttle("auth/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.path.match?(%r{\A/api/v1/auth/(login|register|demo|password)\z}) && req.post?
  end
end
