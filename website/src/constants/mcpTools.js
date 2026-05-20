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
