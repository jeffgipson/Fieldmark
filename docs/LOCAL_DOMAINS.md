# Local domains (`fieldmark.local`)

Use friendly URLs in development instead of remembering ports.

| URL | App |
|-----|-----|
| http://fieldmark.local | Public website (pricing, `/developer`) |
| http://app.fieldmark.local | Farmer app |
| http://api.fieldmark.local | Rails API |
| http://admin.fieldmark.local | Admin |

`localhost` URLs still work (`:5174`, `:5173`, etc.).

## One-time setup

```bash
# 1. Hosts file (asks for your macOS password)
./bin/setup-local-hosts

# 2. Install Caddy (reverse proxy on port 80)
brew install caddy

# 3. Update .env files for all apps
./bin/apply-local-domains-env
# or: npm run setup:local-domains
```

Or run everything in step 1–3:

```bash
npm run setup:local-domains
```

## Daily dev

```bash
FIELDMARK_LOCAL_DOMAINS=1 ./bin/dev
# or
npm run dev:local
```

Restart the stack after changing `.env` files.

## How it works

1. `/etc/hosts` points `*.fieldmark.local` to `127.0.0.1`.
2. [Caddy](https://caddyserver.com/) (`config/Caddyfile`) listens on port 80 and proxies each hostname to the correct Vite/Rails port.
3. Env vars in `config/local-domains.env` are merged into each app's `.env` for links and CORS.

## Troubleshooting

- **“Blocked request” from Vite** — restart dev servers after pulling; `config/vite-local-hosts.js` whitelists the hostnames.
- **CORS errors** — run `./bin/apply-local-domains-env` and restart the API.
- **403 on `/api/...` (Blocked hosts)** — restart the API after pulling; `development.rb` allows `*.fieldmark.local` for the Vite proxy.
- **Port 80 in use** — stop other web servers (`sudo lsof -i :80`) or change ports in `config/Caddyfile`.
