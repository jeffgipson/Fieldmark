# Fieldmark CLI & MCP Server

TypeScript tools for the [Fieldmark API](../../api/docs/API.md): a command-line client and an [MCP](https://modelcontextprotocol.io) server for Cursor and other AI assistants.

## Prerequisites

- Node.js 20+
- Fieldmark API running (`cd api && bin/rails server`)

## Install

```bash
cd tools/fieldmark
npm install
npm run build
```

Link globally (optional):

```bash
npm link
```

## Configuration

Credentials are stored in `~/.fieldmark/config.json` after login, or via environment variables:

| Variable | Description |
|----------|-------------|
| `FIELDMARK_API_URL` | API base URL (default `http://localhost:3000`) |
| `FIELDMARK_TOKEN` | JWT bearer token |
| `FIELDMARK_EMAIL` | User email (informational) |

## CLI

```bash
# Health
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
fieldmark decide 1 -t proceed --notes "Margins acceptable"
```

Development without linking:

```bash
npm run dev:cli -- health
npm run dev:cli -- auth login -e you@example.com -p password123
```

## MCP Server (Cursor)

Add to `.cursor/mcp.json` in the project root (or user settings):

```json
{
  "mcpServers": {
    "fieldmark": {
      "command": "node",
      "args": ["/absolute/path/to/Fieldmark/tools/fieldmark/dist/mcp-server.js"],
      "env": {
        "FIELDMARK_API_URL": "http://localhost:3000",
        "FIELDMARK_TOKEN": "your-jwt-token"
      }
    }
  }
}
```

Get a token via `fieldmark auth login`, then copy from `~/.fieldmark/config.json`.

### MCP tools

| Tool | Description |
|------|-------------|
| `fieldmark_health` | API health check |
| `fieldmark_benchmarks` | Regional MU Extension benchmarks |
| `fieldmark_farms_list` / `fieldmark_farms_create` | Farms |
| `fieldmark_fields_list` / `fieldmark_fields_create` | Fields |
| `fieldmark_input_costs_create` | Input costs |
| `fieldmark_scenarios_create` | Scenarios |
| `fieldmark_scenarios_calculate` | Margin calculation |
| `fieldmark_scenarios_compare` | Peer comparison |
| `fieldmark_analyst_ask` | AI analyst Q&A |
| `fieldmark_report_generate` | Lender report |
| `fieldmark_decision_create` | Log decision |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run dev:cli` | Run CLI via tsx |
| `npm run dev:mcp` | Run MCP server via tsx |
