# frozen_string_literal: true

class IntegrationsCatalogService
  STATUSES = %w[active in_progress planned].freeze

  Entry = Data.define(
    :slug,
    :name,
    :category,
    :status,
    :description,
    :used_in,
    :connection_key,
    :docs_url
  )

  ENTRIES = [
    Entry.new(
      slug: "mu_extension",
      name: "MU Extension",
      category: "data",
      status: "active",
      description: "Official Missouri corn and soybean crop budgets — the independent baseline for peer comparison.",
      used_in: "Benchmarks, scenarios, and Dale context",
      connection_key: nil,
      docs_url: "https://extension.missouri.edu/programs/ag-business-policy"
    ),
    Entry.new(
      slug: "usda_nass",
      name: "USDA NASS",
      category: "data",
      status: "active",
      description: "Historical Missouri yield statistics for downside planning and target yield checks.",
      used_in: "Farm yield context, scenario target planning",
      connection_key: nil,
      docs_url: "https://quickstats.nass.usda.gov/"
    ),
    Entry.new(
      slug: "macro_drivers",
      name: "Macro cost drivers",
      category: "data",
      status: "active",
      description: "Diesel and fertilizer escalation assumptions cited from public sources — stress-test operating costs.",
      used_in: "Scenario calculate, macro pressures card",
      connection_key: nil,
      docs_url: nil
    ),
    Entry.new(
      slug: "dale",
      name: "D.A.L.E. (Claude)",
      category: "ai",
      status: "active",
      description: "Independent agricultural financial analyst — chat, context findings, and lender reports.",
      used_in: "Talk to Dale, analyst reports",
      connection_key: "anthropic",
      docs_url: nil
    ),
    Entry.new(
      slug: "perplexity",
      name: "Perplexity Sonar",
      category: "ai",
      status: "active",
      description: "Live cited USDA drought monitor, crop progress, and MU Extension field conditions — retrieval only; Dale still analyzes with Claude.",
      used_in: "Farm summary, scenario risk panel, Dale context",
      connection_key: "perplexity",
      docs_url: "https://docs.perplexity.ai/"
    ),
    Entry.new(
      slug: "google_maps",
      name: "Google Maps",
      category: "maps",
      status: "active",
      description: "Address search and map picker when you set up farms and field locations.",
      used_in: "Registration, My Farm, field boundaries",
      connection_key: "google_maps",
      docs_url: "https://developers.google.com/maps"
    ),
    Entry.new(
      slug: "regrid",
      name: "Regrid",
      category: "maps",
      status: "active",
      description: "County parcel outlines to speed up field mapping and acre estimates.",
      used_in: "Field boundary picker and map tiles",
      connection_key: "regrid",
      docs_url: "https://regrid.com/api"
    ),
    Entry.new(
      slug: "openstreetmap",
      name: "OpenStreetMap",
      category: "maps",
      status: "active",
      description: "Farmland boundary fallback when parcel data is unavailable.",
      used_in: "Field boundary search",
      connection_key: nil,
      docs_url: "https://www.openstreetmap.org"
    ),
    Entry.new(
      slug: "csv_history",
      name: "CSV history import",
      category: "import",
      status: "active",
      description: "Upload a spreadsheet from your accountant, FSA, or elevator — Dale maps season actuals and costs.",
      used_in: "Scenario page → season actuals",
      connection_key: nil,
      docs_url: nil
    ),
    Entry.new(
      slug: "fieldmark_api",
      name: "Fieldmark API & MCP",
      category: "developer",
      status: "active",
      description: "REST API and Model Context Protocol server for advisors, scripts, and Cursor agents.",
      used_in: "Developer docs and playground",
      connection_key: nil,
      docs_url: nil
    ),
    Entry.new(
      slug: "stripe",
      name: "Stripe",
      category: "platform",
      status: "in_progress",
      description: "Farmer subscriptions ($30–50/mo), vendor directory listings ($100/mo), promotional placement, and revenue-share settlements.",
      used_in: "Profile → Plan & billing",
      connection_key: "stripe",
      docs_url: "https://stripe.com/docs"
    ),
    Entry.new(
      slug: "sendgrid",
      name: "SendGrid",
      category: "platform",
      status: "active",
      description: "Branded transactional email — password reset, invites, and report-ready notifications. Enable delivery with SMTP or MAILER_DELIVER.",
      used_in: "Account email and report delivery",
      connection_key: "sendgrid",
      docs_url: "https://docs.sendgrid.com/"
    ),
    Entry.new(
      slug: "hunter",
      name: "Hunter",
      category: "platform",
      status: "active",
      description: "Company logo lookup for integration cards and the local resources directory — keeps partner listings recognizable.",
      used_in: "Integrations, local resources",
      connection_key: nil,
      docs_url: "https://hunter.io/api/logo"
    ),
    Entry.new(
      slug: "live_bls",
      name: "Live BLS PPI",
      category: "data",
      status: "in_progress",
      description: "Automatic diesel and fertilizer producer price updates instead of seeded macro drivers.",
      used_in: "Macro cost stress on scenarios",
      connection_key: nil,
      docs_url: "https://www.bls.gov/ppi/"
    ),
    Entry.new(
      slug: "john_deere",
      name: "John Deere Operations Center",
      category: "farm_platform",
      status: "in_progress",
      description: "Import field boundaries and harvest yields from your existing ops data.",
      used_in: "My Farm, season actuals",
      connection_key: nil,
      docs_url: "https://developer.deere.com/"
    ),
    Entry.new(
      slug: "climate_fieldview",
      name: "Climate FieldView",
      category: "farm_platform",
      status: "in_progress",
      description: "Read-only sync for fields and yield maps — no vendor recommendations.",
      used_in: "My Farm, season actuals",
      connection_key: nil,
      docs_url: "https://climate.com/en-us/fieldview.html"
    ),
    Entry.new(
      slug: "quickbooks",
      name: "QuickBooks",
      category: "farm_platform",
      status: "planned",
      description: "Pull operating expenses by category to pre-fill or validate input costs.",
      used_in: "Input costs",
      connection_key: nil,
      docs_url: "https://developer.intuit.com/"
    ),
    Entry.new(
      slug: "cme_prices",
      name: "CME / cash prices",
      category: "data",
      status: "planned",
      description: "Futures and local cash bid references with citations for scenario price bands.",
      used_in: "Scenario assumptions",
      connection_key: nil,
      docs_url: nil
    )
  ].freeze

  # Subdomains from docs_url often work; override when a root brand domain is clearer.
  LOGO_DOMAIN_OVERRIDES = {
    "dale" => "anthropic.com",
    "google_maps" => "google.com",
    "cme_prices" => "cmegroup.com",
    "hunter" => "hunter.io"
  }.freeze

  NO_LOGO_SLUGS = %w[macro_drivers csv_history fieldmark_api].freeze

  CATEGORY_LABELS = {
    "data" => "Data & benchmarks",
    "maps" => "Maps & location",
    "ai" => "AI analyst",
    "import" => "Import & export",
    "developer" => "Developer",
    "platform" => "Platform",
    "farm_platform" => "Farm software"
  }.freeze

  def self.call
    new.call
  end

  def call
    {
      connections: connection_flags,
      categories: CATEGORY_LABELS,
      integrations: ENTRIES.map { |entry| entry_payload(entry) }
    }
  end

  private

  def connection_flags
    {
      anthropic: config_present?(:anthropic_api_key),
      perplexity: config_present?(:perplexity_api_key),
      google_maps: config_present?(:google_maps_api_key),
      regrid: config_present?(:regrid_api_key),
      stripe: stripe_connected?,
      sendgrid: sendgrid_connected?,
      mailer: AppConfig.respond_to?(:mailer_deliver?) && AppConfig.mailer_deliver?
    }
  end

  def config_present?(method)
    AppConfig.respond_to?(method) && AppConfig.public_send(method).present?
  end

  def stripe_connected?
    return true if AppConfig.respond_to?(:billing_mock?) && AppConfig.billing_mock?

    config_present?(:stripe_secret_key)
  end

  def sendgrid_connected?
    return true if AppConfig.respond_to?(:mailer_deliver?) && AppConfig.mailer_deliver?

    config_present?(:sendgrid_api_key) || config_present?(:smtp_settings)
  end

  def entry_payload(entry)
    connected = entry.connection_key ? connection_flags[entry.connection_key.to_sym] : nil
    logo_domain = resolve_logo_domain(entry)

    {
      slug: entry.slug,
      name: entry.name,
      category: entry.category,
      status: entry.status,
      description: entry.description,
      used_in: entry.used_in,
      docs_url: entry.docs_url,
      logo_domain: logo_domain,
      logo_url: HunterLogo.url_for_domain(logo_domain),
      connected: connected
    }
  end

  def resolve_logo_domain(entry)
    return nil if NO_LOGO_SLUGS.include?(entry.slug)

    override = LOGO_DOMAIN_OVERRIDES[entry.slug]
    return override if override.present?
    return nil if entry.docs_url.blank?

    HunterLogo.domain_from_url(entry.docs_url)
  end
end
