# Fieldmark

> Know your margins before March.

Fieldmark is a farm financial planning tool that gives mid-scale Midwest 
corn and soybean farmers independent benchmark data and AI-powered analysis 
before they commit to expensive input purchases.

## The Problem

Every February and March, farmers lock in seed, fertilizer, and chemical 
costs — often $50,000–$100,000+ — without independent data to validate 
whether those costs are reasonable. The advisors they rely on (agronomists, 
co-ops) often sell the same inputs they recommend. Lenders focus on debt 
service, not profitability.

The result: farmers make high-stakes decisions in the dark.

## The Solution

Fieldmark gives farmers three things before they sign:

1. **Peer Benchmarking** — compare your per-field input costs against 
   regional averages sourced from University of Missouri Extension data
2. **Scenario Modeling** — model base case and downside margins at 
   different commodity prices and yields
3. **AI Analyst** — an independent agricultural financial analyst that 
   interprets your data in plain language and generates a report you 
   can share with your lender

## Demo

**The demo arc:**
1. Enter your farm's input costs (seed, fertilizer, chemicals)
2. See how your costs compare to similar Missouri farms
3. Run a downside scenario ("what if corn drops to $3.80?")
4. Ask the AI analyst to explain what it means
5. Generate a lender-ready report
6. Walk into March with ammunition

## Tech Stack

### Backend
- Ruby on Rails 8 (API-only)
- PostgreSQL
- Redis + Sidekiq (background jobs)
- Devise + JWT authentication
- Anthropic Claude API (AI analyst)
- Rack::Attack (rate limiting)

### Frontend
- React + Vite
- Tailwind CSS

## Benchmark Data

Regional benchmarks are sourced from official University of Missouri 
Extension 2026 crop planning budgets (publications g651 and g654), 
published October 2025.

| Category | Corn ($/acre) | Soybean ($/acre) |
|----------|--------------|-----------------|
| Seed | $99.38 | $75.00 |
| Fertilizer | $187.01 | $91.28 |
| Chemicals | $104.00 | $113.25 |
| Labor | $22.60 | $11.52 |
| **Total Operating** | **$600.07** | **$387.69** |
| **Total w/ Ownership** | **$902.47** | **$642.57** |

Assumed yields: Corn 176 bu/acre at $4.33/bu | Soybean 57 bu/acre 
at $10.43/bu

## Getting Started

### Prerequisites
- Ruby 3.3+
- PostgreSQL 14+
- Redis 7+ (for Sidekiq background jobs)
- Node 20+

### Backend Setup

```bash
cd api
bundle install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
rails db:create db:migrate db:seed
bin/rails demo:seed   # optional: demo@fieldmark.app with sample farm + scenario

# Terminal 1 — API server
rails server

# Terminal 2 — background job worker (required for lender reports; needs Redis)
bin/jobs
```

### Smoke test

```bash
api/bin/test_api                    # full API flow (report enqueue only)
RUN_AI_SMOKE=1 api/bin/test_api     # + live Claude + poll completed report (needs bin/jobs)
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3000 (or leave empty to use Vite proxy)
npm run dev
```

Open http://localhost:5173 — sign in with the demo account after `bin/rails demo:seed`:

### Marketing Website

Separate React site (Climate FieldView–style landing page) in `website/`:

```bash
cd website
npm install
cp .env.example .env
# VITE_APP_URL=http://localhost:5173  (links to the app for sign up / sign in)
npm run dev
```

Open http://localhost:5174 — hero carousel, solutions, how-it-works, Dale, testimonials, and CTAs into the app.

- **Email:** `demo@fieldmark.app`
- **Password:** `password123`

The app includes landing, auth, dashboard, farm/field setup, input costs, benchmark reveal, scenario modeling, Talk to Dale chat, and lender reports.

### Environment Variables

```bash
# api/.env.example
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=postgresql://localhost/fieldmark_development
JWT_SECRET_KEY=your_secret_here
REDIS_URL=redis://localhost:6379/0
```

## Documentation

- **[Brand Guide](docs/BRAND.md)** — colors, typography, Dale, voice and tone, UI components
- **[API Reference](api/docs/API.md)** — full endpoint documentation, request/response shapes, enums, and client flow
- **[llm.txt](llm.txt)** — condensed context for AI coding assistants (data model, routes, conventions)

### Quick start (authenticated)

```bash
# After rails server is running
curl http://localhost:3000/api/health

# Register and capture token
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"you@example.com","password":"password123","password_confirmation":"password123","first_name":"Mike","last_name":"Henderson"}}'

# Use: Authorization: Bearer <token> on /api/v1/* routes
```

Run the full smoke test: `cd api && bin/test_api`

## CLI & MCP Server

TypeScript tools in `tools/fieldmark/` for terminal and Cursor integration.

```bash
cd tools/fieldmark
npm install && npm run build

# CLI
node dist/cli.js health
node dist/cli.js auth login -e you@example.com -p password123
node dist/cli.js benchmarks -r central -c corn
node dist/cli.js ask --farm-id 1 --scenario-id 1 "How do my costs compare to peers?"

# MCP — see tools/fieldmark/README.md and .cursor/mcp.json
```

Full docs: [tools/fieldmark/README.md](tools/fieldmark/README.md)

### Authentication
