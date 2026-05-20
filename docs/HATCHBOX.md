# Hatchbox deploy — Fieldmark API

The Rails app lives in **`api/`**. Set Hatchbox **Root directory** to `api` (or deploy from repo root with app path `api` per your Hatchbox project layout).

## Required environment variables

Set these in **Hatchbox → Apps → field_mark → Environment** (app-wide, all servers).

### `DATABASE_URL` (required — deploy fails without it)

Hatchbox does **not** auto-create this unless you add it.

1. Create or open your **managed Postgres** (DigitalOcean, Crunchy, etc.) and copy the connection URL, e.g.  
   `postgresql://user:password@host:25060/fieldmark_production?sslmode=require`
2. In Hatchbox: **Apps → field_mark → Environment → Add variable**
   - **Name:** `DATABASE_URL`
   - **Value:** paste the full connection string
3. **Save**, then **Deploy** again.

If you use Hatchbox’s own Postgres addon, open that database in Hatchbox and copy the URL it shows into `DATABASE_URL`.

The app loads `shared/.hatchbox.env` on boot (see `api/config/boot.rb`), but the variable must exist in that file — empty env produces `KeyError: DATABASE_URL`.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Managed Postgres connection string (see steps above). |
| `REDIS_URL` | Sidekiq + Action Cable (`redis://…`) |
| `JWT_SECRET_KEY` | Devise JWT signing |
| `RAILS_MASTER_KEY` | Decrypt `config/credentials.yml.enc` |
| `ANTHROPIC_API_KEY` | D.A.L.E. / analyst reports |
| `CORS_ORIGINS` | Farmer app origin(s), e.g. `https://app.fieldmark.app` |
| `FRONTEND_URL` | Password reset links, e.g. `https://app.fieldmark.app` |

Optional: `DEMO_EMAIL`, `DEMO_PASSWORD`, `NASS_API_KEY`, `PERPLEXITY_API_KEY`, mailer vars — see `api/.env.example`.

Do **not** rely on a `.env` file in production; Hatchbox injects env via `.hatchbox.env`.

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

```bash
RAILS_ENV=production bundle exec rake demo:seed
# or sample_data:seed — see api/lib/tasks/
```
