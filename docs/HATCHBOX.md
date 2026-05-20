# Hatchbox deploy — Fieldmark API

The Rails app lives in **`api/`**. Set Hatchbox **Root directory** to `api` (or deploy from repo root with app path `api` per your Hatchbox project layout).

## Required environment variables

Set these in **Hatchbox → field_mark app → Environment** (applies to **all servers** in the cluster: sparkling-water, wild-river, cold-paper, etc.).

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Managed Postgres connection string. **Attach a PostgreSQL database** to the app in Hatchbox so this is set automatically. Without it, deploy fails on `db:migrate` with a local socket error. |
| `REDIS_URL` | Sidekiq + Action Cable (`redis://…`) |
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

## After first successful deploy

Rails uses **three DB configs** (primary, cache, cable) on one Postgres URL. Hatchbox `db:migrate` only runs primary migrations unless you also load cache/cable:

```bash
cd /home/deploy/field_mark/current
RAILS_ENV=production bundle exec rake db:migrate
DISABLE_DATABASE_ENVIRONMENT_CHECK=1 RAILS_ENV=production bundle exec rake db:schema:load:cache db:schema:load:cable
RAILS_ENV=production bundle exec rake demo:seed
```

Without `solid_cache_entries`, auth requests fail (`PG::UndefinedTable`) when Rack::Attack uses Solid Cache.

Health check: `GET /api/health` (not `/` or `/up` — API-only app). Optional: `sample_data:seed` for all Cape Girardeau test farmers.
