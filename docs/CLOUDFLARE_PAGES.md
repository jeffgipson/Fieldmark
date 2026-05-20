# Cloudflare Pages — Fieldmark frontends

The **website**, **farmer app**, and **admin** are static Vite/React builds. Deploy them to **Cloudflare Pages** (not Workers — the API stays on Hatchbox or another Ruby host).

## Prerequisites

1. **Wrangler CLI** logged in (you already are if `wrangler whoami` works):

   ```bash
   npm install -g wrangler   # or use npx wrangler
   wrangler login
   ```

2. **Account ID** from `wrangler whoami` → set in `config/cloudflare-pages.env`.

3. **Rails API** running with HTTPS and CORS allowing your Pages origins.

## One-time setup

```bash
cp config/cloudflare-pages.env.example config/cloudflare-pages.env
# Edit: CLOUDFLARE_ACCOUNT_ID, API_URL, and your *.pages.dev or custom URLs
chmod +x bin/deploy-cloudflare-pages
```

| Variable | Example |
|----------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | From `wrangler whoami` |
| `API_URL` | `https://api.fieldmark.app` |
| `WEBSITE_URL` | `https://www.fieldmark.app` or `https://fieldmark-website.pages.dev` |
| `APP_URL` | `https://app.fieldmark.app` |
| `ADMIN_URL` | `https://admin.fieldmark.app` |

`VITE_*` URLs are baked in at **build time**. After the first deploy, copy the `*.pages.dev` URLs from the Cloudflare dashboard into `cloudflare-pages.env` and redeploy so cross-links work.

## Deploy from the repo

```bash
./bin/deploy-cloudflare-pages          # all three
./bin/deploy-cloudflare-pages website  # marketing only
./bin/deploy-cloudflare-pages app      # farmer app only
./bin/deploy-cloudflare-pages admin    # admin only
```

Creates or updates Pages projects:

| Project | Source | Default name |
|---------|--------|----------------|
| Marketing + API docs | `website/` | `fieldmark-website` |
| Farmer app | `client/` | `fieldmark-app` |
| Admin | `frontend/admin/` | `fieldmark-admin` |

## Custom domains

Cloudflare dashboard → **Workers & Pages** → project → **Custom domains** → add e.g. `app.fieldmark.app`, then update `cloudflare-pages.env` and redeploy.

## Rails API (Hatchbox)

Add every front-end origin to **`CORS_ORIGINS`** (comma-separated), e.g.:

```
https://fieldmark-website.pages.dev,https://fieldmark-app.pages.dev,https://fieldmark-admin.pages.dev
```

Also set **`FRONTEND_URL`** to the farmer app URL (password reset emails).

## SPA routing

Each app includes `public/_redirects` (`/* /index.html 200`) so React Router works on refresh.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API calls fail / CORS | Set `API_URL` in env file; update Rails `CORS_ORIGINS` |
| 404 on `/dashboard` refresh | Ensure `_redirects` is in `public/` and present in `dist/` after build |
| Wrong account | Set `CLOUDFLARE_ACCOUNT_ID` in `config/cloudflare-pages.env` |
| `wrangler` not found | `npm install -g wrangler` or `npx wrangler pages deploy ...` |
