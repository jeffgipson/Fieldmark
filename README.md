# Fieldmark

Fieldmark is a farm financial planning SaaS for mid-scale Midwest corn and soybean farmers (**Hackathon Problem #1 — Baseline: Farm Financial Planning**). Farmers enter **per-field input costs**, then compare against **MU Extension 2026** industry benchmarks and **anonymized regional peer cohorts** before signing seed and fertilizer agreements — with **D.A.L.E.** (Data Analytics for Land Economics) to interpret the numbers without vendor conflicts of interest.

**Judges & AI reviewers:** [`docs/JUDGE_REVIEW.md`](docs/JUDGE_REVIEW.md) · [`llm.txt`](llm.txt) · [`AGENTS.md`](AGENTS.md)

### Submission summary

> Farmers face a structural disadvantage when buying inputs: vendors and advisors may have conflicts of interest. Fieldmark gives **independent ammunition** — **per-field** costs vs **MU Extension** planning budgets and vs **anonymized peer medians** in your region (no farm identities exposed), plus **D.A.L.E.** for plain-language margin and downside analysis and lender-ready reports. Verify: `./bin/dev`, `cd api && bin/rails demo:seed`, `api/bin/test_api`. Demo: `demo@fieldmark.app` / `password123`.

## Meet D.A.L.E.

**Data Analytics for Land Economics**

D.A.L.E. is Fieldmark's AI-powered agricultural financial analyst. Independent. Data-backed. On your side.

## Developer documentation

- **Interactive API docs & playground:** http://localhost:5174/developer (dedicated `website/` app)
- **llm.txt:** http://localhost:5174/llm.txt (also `/llms.txt`; source: repo root — run `npm run sync:llm` after edits)
- **MCP server:** `tools/fieldmark/` — see README for Cursor setup
- **Full API reference:** `api/docs/API.md`

## Running the stack

### Start everything (recommended)

From the repo root:

```bash
./bin/dev
# or: npm run dev
```

This starts the API, farmer app, public website, and admin together.

**Open the website (pricing, hero):** http://localhost:5174  
**Farmer app (sign in):** http://localhost:5173  

If `:5174` shows the wrong app (no pricing table), another process stole the port. Run `./bin/dev-status` — it detects this. Fix with:

```bash
lsof -ti tcp:5173,tcp:5174,tcp:5175,tcp:5176 | xargs kill 2>/dev/null
./bin/dev
```

| Service | URL |
|---------|-----|
| Website (`website/`) | http://localhost:5174 |
| Farmer app (`client/`) | http://localhost:5173 |
| API | http://localhost:3000 |
| Admin | http://localhost:5175 |
| API docs & playground | http://localhost:5174/developer |

Optional background jobs (reports, mail): `FIELDMARK_DEV_JOBS=1 ./bin/dev` or `npm run dev:jobs`.

### Local domains (`fieldmark.local`)

```bash
npm run setup:local-domains   # once: /etc/hosts + .env + brew install caddy
npm run dev:local             # http://fieldmark.local, app.fieldmark.local, …
```

See [docs/LOCAL_DOMAINS.md](docs/LOCAL_DOMAINS.md).

Copy env files once per app (see `config/local-urls.env.example`):

```bash
cp website/.env.example website/.env
cp client/.env.example client/.env
```

In dev, a **Local dev** bar on the website and farmer app links between all services. API docs live only on the website (`/developer`); the farmer app redirects there.

### Running the API alone

```bash
cd api
bin/dev
```

**Database gotcha:** Do not set `DATABASE_URL` in `api/.env` for local work. Rails applies it to every environment, including test — and `bin/rails test` truncates the connected database. That looks like your dev data “keeps getting wiped.” Use `config/database.yml` (`fieldmark_development` / `fieldmark_test`) instead.

### Running the client app alone

```bash
cd client
npm install
npm run dev
```

The client app will be running at http://localhost:5173.

On the **scenario** page, run **Calculate** to see margins plus a **three-year forecast** timeline. After harvest, record **season actuals** so the next season’s forecast can compare plan vs what happened (`docs/FORECASTING_ROADMAP.md`).

### Running the admin app

```bash
cd frontend/admin
npm install
npm run dev
```

Admin is on http://localhost:5175 (Vite may use 5176+ if that port is busy). **The Rails API must be running** (`cd api && bin/dev`) — otherwise login shows a proxy/500 error. Log in with `admin@fieldmark.app` / `password123`, or click **Use Demo Account** to create the admin user automatically.

**Load sample data** (required for farms/users/vendors in admin — demo login only creates the admin account):

```bash
cd api
bin/rails db:seed
```

Then refresh the admin dashboard. Expect ~101 users, 100 farms, 41 vendors.

## Subscription plans (mock billing)

Farmer subscriptions use mock Stripe by default (`BILLING_MOCK=true` in `api/.env`):

| Plan | Price | Farms | Fields |
|------|-------|-------|--------|
| Basic | $30/mo | 1 | Up to 5 |
| Pro | $50/mo | Multiple | Unlimited |

New farmers start on **active Basic** immediately. Upgrade or manage billing under **Profile → Plan & billing**. The demo account (`demo@fieldmark.app`) is seeded on **Pro** for multi-farm demos.

API: `GET /api/v1/billing`, `POST /api/v1/billing/checkout` with `{ "plan": "pro" }`.

## Transactional email

Password reset, invitations, welcome, report-ready, and “email me this report” use a shared branded template (`FieldmarkMailer`). **Outbound delivery is off by default** — mailers and Sidekiq jobs still run, but nothing is sent until you enable it.

| Variable | Purpose |
|----------|---------|
| `MAILER_FROM` | From address (default `Fieldmark <noreply@fieldmark.app>`) |
| `FRONTEND_URL` | Links in emails (reset, invite, report) |
| `MAILER_DELIVER` | Set `true` to send (required until SendGrid adapter ships) |
| `SENDGRID_API_KEY` | Reserved for upcoming SendGrid API delivery (does not send yet) |
| `SMTP_*` | Optional SMTP fallback |

Run `bin/jobs` so async mail (invites, welcome, reports) is processed. API flows return success even when delivery is disabled.

API: `POST /api/v1/auth/password` (request reset), `PUT /api/v1/auth/password` (set new password), `POST /api/v1/scenarios/:id/report/email` (copy completed report to the signed-in user).
