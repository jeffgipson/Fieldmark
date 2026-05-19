# Fieldmark

Fieldmark is a farm financial planning tool that gives mid-scale Midwest corn and soybean farmers independent benchmark data and AI-powered analysis before they commit to expensive input purchases.

## Running the stack

### Running the API

```bash
cd api
bin/dev
```

**Database gotcha:** Do not set `DATABASE_URL` in `api/.env` for local work. Rails applies it to every environment, including test — and `bin/rails test` truncates the connected database. That looks like your dev data “keeps getting wiped.” Use `config/database.yml` (`fieldmark_development` / `fieldmark_test`) instead.

### Running the client app

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
