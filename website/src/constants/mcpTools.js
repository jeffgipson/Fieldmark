/** MCP tools exposed by tools/fieldmark — keep in sync with mcp-server.ts */

export const MCP_TOOLS = [
  { name: "fieldmark_health", description: "API health check (no auth)" },
  { name: "fieldmark_benchmarks", description: "Regional MU Extension benchmarks" },
  { name: "fieldmark_farms_list", description: "List farms for the authenticated user" },
  { name: "fieldmark_farms_create", description: "Create a new farm" },
  { name: "fieldmark_fields_list", description: "List fields on a farm" },
  { name: "fieldmark_fields_create", description: "Create a field" },
  { name: "fieldmark_input_costs_create", description: "Add input cost to a field" },
  { name: "fieldmark_scenarios_create", description: "Create a margin scenario" },
  { name: "fieldmark_scenarios_calculate", description: "Calculate scenario margins" },
  { name: "fieldmark_scenarios_compare", description: "Run peer benchmark comparison" },
  { name: "fieldmark_analyst_ask", description: "Ask the AI analyst a question" },
  { name: "fieldmark_report_generate", description: "Generate async lender report" },
  { name: "fieldmark_decision_create", description: "Log farmer decision on a scenario" }
];

export const MCP_CONFIG_EXAMPLE = `{
  "mcpServers": {
    "fieldmark": {
      "command": "node",
      "args": ["/absolute/path/to/Fieldmark/tools/fieldmark/dist/mcp-server.js"],
      "env": {
        "FIELDMARK_API_URL": "http://localhost:3000",
        "FIELDMARK_TOKEN": "your-jwt-from-login-or-demo"
      }
    }
  }
}`;

export const MCP_ENV_VARS = [
  { name: "FIELDMARK_API_URL", description: "API base URL", default: "http://localhost:3000" },
  { name: "FIELDMARK_TOKEN", description: "JWT bearer token (required for most tools)" },
  { name: "FIELDMARK_EMAIL", description: "User email (informational, optional)" }
];

export const MCP_INSTALL_STEPS = [
  "cd tools/fieldmark",
  "npm install",
  "npm run build"
];

export const MCP_CLI_EXAMPLES = `# Health
fieldmark health

# Auth
fieldmark auth register -e you@example.com -p password123 --first-name Mike --last-name Henderson
fieldmark auth login -e you@example.com -p password123
fieldmark auth whoami
fieldmark auth logout

# Benchmarks
fieldmark benchmarks -r central -c corn -y 2026

# Farms & fields
fieldmark farms list
fieldmark farms create -n "Henderson Farm" -a 1200 --county "Cape Girardeau" --region central --commodity corn
fieldmark fields list 1
fieldmark fields create 1 -n "North 80" -a 80 --soil "Silt loam" --commodity corn

# Scenarios
fieldmark scenarios create 1 -n "Base 2026" --price 4.33 --yield 176 --downside-price 3.80 --downside-yield 160
fieldmark scenarios calculate 1 1
fieldmark scenarios compare 1 1

# AI analyst
fieldmark ask --farm-id 1 --scenario-id 1 "How do my seed costs compare to peers?"
fieldmark report 1

# Decision
fieldmark decide 1 -t proceed --notes "Margins acceptable"`;
