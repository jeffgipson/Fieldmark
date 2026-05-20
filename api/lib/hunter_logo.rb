# frozen_string_literal: true

# Hunter Logo API — https://hunter.io/api/logo (free, domain-based marks).
module HunterLogo
  BASE = "https://logos.hunter.io"

  module_function

  def domain_from_url(url)
    return nil if url.blank?

    uri = URI.parse(url.to_s.strip)
    host = uri.host&.delete_prefix("www.")
    host.presence
  rescue URI::InvalidURIError
    nil
  end

  def url_for_domain(domain)
    normalized = domain.to_s.strip.downcase.delete_prefix("www.")
    return nil if normalized.blank?

    "#{BASE}/#{normalized}"
  end

  def url_for_website(website)
    url_for_domain(domain_from_url(website))
  end

  def payload_for_website(website)
    domain = domain_from_url(website)
    return { logo_domain: nil, logo_url: nil } if domain.blank?

    { logo_domain: domain, logo_url: url_for_domain(domain) }
  end
end
