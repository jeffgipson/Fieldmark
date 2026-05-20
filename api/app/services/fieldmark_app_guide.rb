# frozen_string_literal: true

# Single source of truth for in-app navigation Dale uses in chat.
# Keep in sync with client/src/App.jsx routes and sidebar labels.
class FieldmarkAppGuide
  NAVIGATION = [
    { path: "/dashboard", label: "Dashboard", purpose: "Farm overview, readiness, and quick links" },
    { path: "/farm", label: "My Farm", purpose: "Farm profile, fields, acres, and map boundaries" },
    { path: "/fields/:field_id/costs", label: "Field input costs", purpose: "Per-acre seed, fertilizer, chemicals for the planning season" },
    { path: "/scenarios", label: "Scenarios", purpose: "List scenarios; open one to model margins and season history" },
    { path: "/scenarios/:scenario_id", label: "Scenario detail", purpose: "Price/yield assumptions, calculate margins, season actuals, CSV import, decision log" },
    { path: "/scenarios/:scenario_id/benchmark", label: "Benchmarks", purpose: "MU Extension budgets vs your costs and anonymized peer comparison" },
    { path: "/scenarios/:scenario_id/report", label: "Lender report", purpose: "Generate and view the async D.A.L.E. lender report for this scenario" },
    { path: "/reports", label: "Reports", purpose: "Shortcut to lender reports (uses your primary scenario when linked)" },
    { path: "/resources", label: "Resources", purpose: "Vendor and advisor directory (not for product how-to)" },
    { path: "/integrations", label: "Integrations", purpose: "Connected data sources and import tools overview" },
    { path: "/profile", label: "Profile", purpose: "Account, plan, and billing" },
    { path: "/help", label: "Help & support", purpose: "FAQ; email support if Dale cannot resolve navigation" }
  ].freeze

  TASKS = [
    {
      id: "enter_input_costs",
      summary: "Enter current-season input costs per field",
      steps: [
        "Sidebar → My Farm",
        "Select a field → open input costs",
        "Enter per-acre seed, fertilizer, chemicals, and other costs; save"
      ],
      paths: ["/farm", "/fields/:field_id/costs"]
    },
    {
      id: "run_scenario",
      summary: "Model base and downside margins",
      steps: [
        "Sidebar → Scenarios → open a scenario (e.g. Base Case)",
        "Set commodity price and yield assumptions",
        "Run Calculate, then open Benchmarks for peer comparison"
      ],
      paths: ["/scenarios", "/scenarios/:scenario_id", "/scenarios/:scenario_id/benchmark"]
    },
    {
      id: "import_csv_margin_history",
      summary: "Import prior-season actuals (yield, price, operating costs) from a CSV",
      steps: [
        "Sidebar → Scenarios → open your scenario",
        "Scroll to the Season actuals section",
        "Use Upload history CSV (preview optional), or add seasons manually in the same panel",
        "Integrations also lists CSV history import under import tools"
      ],
      paths: ["/scenarios/:scenario_id"],
      context_keys: %w[season_snapshots history_imports]
    },
    {
      id: "lender_report",
      summary: "Generate a lender-ready report",
      steps: [
        "Sidebar → Reports, or open a scenario → Lender report",
        "Request generation; keep the API jobs worker running locally (cd api && bin/jobs)",
        "Poll until status is completed, then print or email"
      ],
      paths: ["/reports", "/scenarios/:scenario_id/report"]
    },
    {
      id: "talk_to_dale",
      summary: "Open D.A.L.E. chat",
      steps: ["Sidebar → Talk to Dale (available on any page)"]
    }
  ].freeze

  def self.payload(scenario: nil, client_path: nil)
    {
      product: "Fieldmark farmer web app",
      navigation: NAVIGATION,
      common_tasks: TASKS,
      path_placeholders: path_placeholders(scenario),
      client_location: client_location(client_path),
      help: {
        in_app: "/help",
        support_email_note: "Help & support page or email from Profile/Help footer"
      },
      rules: [
        "For where/how questions, answer from common_tasks and navigation — do not say you lack UI visibility.",
        "Replace :scenario_id with path_placeholders.scenario_id when giving a specific link path.",
        "When client_location is set, say where the farmer is now and give scroll/sidebar steps from there.",
        "Financial numbers still come only from farm context JSON, not from this guide."
      ]
    }
  end

  def self.client_location(path)
    normalized = path.to_s.split("?").first.presence
    return nil unless normalized

    { path: normalized, page: match_page(normalized) }
  end

  def self.match_page(path)
    exact = NAVIGATION.find { |entry| entry[:path] == path }
    return exact.slice(:label, :purpose) if exact

    case path
    when %r{\A/fields/\d+/costs\z}
      { label: "Field input costs", purpose: "Per-acre costs for one field" }
    when %r{\A/scenarios/\d+\z}
      { label: "Scenario detail", purpose: "Margins, season actuals, CSV import, decision log" }
    when %r{\A/scenarios/\d+/benchmark\z}
      { label: "Benchmarks", purpose: "Extension and peer cost comparison for this scenario" }
    when %r{\A/scenarios/\d+/report\z}
      { label: "Lender report", purpose: "Generate or view lender report for this scenario" }
    when %r{\A/resources/}
      { label: "Resource detail", purpose: "Vendor or advisor profile" }
    end
  end

  def self.path_placeholders(scenario)
    {
      scenario_id: scenario&.id,
      note: scenario ? "Use this scenario id in paths below." : "No scenario linked to chat — tell the farmer to open Scenarios first or pick a scenario in chat context."
    }
  end
end
