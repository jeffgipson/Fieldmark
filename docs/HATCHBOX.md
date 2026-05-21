# Hatchbox deploy — Fieldmark API

The Rails app lives in **`api/`**. Set Hatchbox **Root directory** to `api` (or deploy from repo root with app path `api` per your Hatchbox project layout).

## Required environment variables

Set these in **Hatchbox → Apps → field_mark → Environment** (app-wide, all servers in the cluster).

### `DATABASE_URL` (required — deploy fails without it)

Hatchbox does **not** auto-create this unless you attach Postgres or add it manually.

1. Create or open your **managed Postgres** (DigitalOcean, Crunchy, Hatchbox addon, etc.) and copy the connection URL, e.g.  
   `postgresql://user:password@host:25060/fieldmark_production?sslmode=require`
2. In Hatchbox: **Apps → field_mark → Environment → Add variable** (or **attach PostgreSQL** to the app so this is set automatically)
   - **Name:** `DATABASE_URL`
   - **Value:** paste the full connection string
3. **Save**, then **Deploy** again.

**DigitalOcean managed Postgres:** add **every** Hatchbox server IP to **Databases → your cluster → Trusted sources** (web and worker nodes). Otherwise migrations, seed, and Sidekiq jobs fail with connection timeouts.

If you use Hatchbox’s own Postgres addon, open that database in Hatchbox and copy the URL it shows into `DATABASE_URL`.

The app loads `shared/.hatchbox.env` on boot (see `api/config/boot.rb`), but the variable must exist in that file — empty env produces `KeyError: DATABASE_URL` or socket errors.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Managed Postgres connection string (see steps above). |
| `REDIS_URL` | Sidekiq + Action Cable (`redis://…`) — attach **Redis** in Hatchbox or paste URL |
| `JWT_SECRET_KEY` | Devise JWT signing |
| `RAILS_MASTER_KEY` | Decrypt `config/credentials.yml.enc` |
| `ANTHROPIC_API_KEY` | D.A.L.E. / analyst reports |
| `CORS_ORIGINS` | Farmer app origin(s), e.g. `https://app.fieldmark.app` |
| `FRONTEND_URL` | Password reset links, e.g. `https://app.fieldmark.app` |

Optional: `DEMO_EMAIL`, `DEMO_PASSWORD`, `NASS_API_KEY`, `PERPLEXITY_API_KEY`, mailer vars — see `api/.env.example`.

Do **not** rely on a `.env` file in production; Hatchbox injects env via `.hatchbox.env`.

Also set **`RAILS_ENV=production`** in Hatchbox Environment (the app defaults to production when `.hatchbox.env` exists, but setting it explicitly avoids surprises).

## Deploy branch

Production deploys should track **`main`** (includes Hatchbox boot fixes). After pushing, trigger **Deploy** in Hatchbox.

## Verify on a server (SSH)

```bash
cd /home/deploy/field_mark/current/api
grep DATABASE_URL ../../../shared/.hatchbox.env   # or echo $DATABASE_URL
RAILS_ENV=production bundle exec rake db:migrate:status
```

If `DATABASE_URL` is empty, link Postgres to the app or paste the connection URL into Environment and redeploy.

## Common failures

| Symptom | Fix |
|---------|-----|
| `Dotenv.instrumenter=` | Deploy latest `main` (boot guard + Kamal in dev group). |
| `cannot load such file -- faker` | Deploy latest `main` (lazy sample_data require). |
| `connection to server on socket "/var/run/postgresql/..."` | Set `DATABASE_URL` on **every** server; attach Hatchbox Postgres to the app. |
| One server deploys, others fail | Environment not synced — set app-level env in Hatchbox, redeploy all. |
| DB connection timeout from one server | Add that server’s IP to Postgres **trusted sources** (DO, Crunchy, etc.). |
| Lender report stuck on **pending** / never completes | **Sidekiq worker not running.** API enqueues jobs; something must run `bin/jobs`. See [Background worker](#background-worker-sidekiq) below. |

## Background worker (Sidekiq)

Async features (lender reports, `deliver_later` mail) use **Sidekiq** + **Redis**. The web process (`field_mark-server`) does **not** run jobs.

1. Attach **Redis** to the app in Hatchbox (sets `REDIS_URL`) or set `REDIS_URL` in Environment.
2. Hatchbox → **field_mark** → **Processes** → **Add process**
3. **Command:** `bin/jobs` (runs `bundle exec sidekiq -C config/sidekiq.yml`)
4. Enable **Restart on deploy**
5. Deploy (or start the process)

Verify on the server:

```bash
# Should show a sidekiq process for field_mark (not just field_mark-server)
ps aux | grep sidekiq | grep field_mark

cd /home/deploy/field_mark/current
RAILS_ENV=production bundle exec rails runner "puts Sidekiq::Queue.new('default').size"
```

Stuck reports in `pending` after the worker starts will be picked up automatically. To replay one job immediately:

```bash
RAILS_ENV=production bundle exec rails runner "GenerateAnalystReportJob.perform_now(REPORT_ID)"
```

## After first successful deploy

Rails uses **three DB configs** (primary, cache, cable) on one Postgres URL. Hatchbox `db:migrate` only runs primary migrations unless you also load cache/cable:

```bash
cd /home/deploy/field_mark/current
RAILS_ENV=production bundle exec rake db:migrate
DISABLE_DATABASE_ENVIRONMENT_CHECK=1 RAILS_ENV=production bundle exec rake db:schema:load:cache db:schema:load:cable
RAILS_ENV=production bundle exec rake demo:seed
# demo:seed includes vendors; or run vendors:seed and admin:seed separately
```

Without `solid_cache_entries`, auth requests fail (`PG::UndefinedTable`) when Rack::Attack uses Solid Cache.

Health check: `GET /api/health` (not `/` or `/up` — API-only app). Optional: `sample_data:seed` for all Cape Girardeau test farmers.
