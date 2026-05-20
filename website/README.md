# Fieldmark Website

Public homepage and developer API docs for Fieldmark — separate from the farmer `client/` app.

Inspired by enterprise ag marketing sites (e.g. [Climate FieldView](https://climate.com/en-us.html)): full-bleed hero carousel, stat cards, solutions grid, accordion how-it-works, Dale feature section, farmer stories, and footer CTA.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

- **Website:** http://localhost:5174
- **API docs & playground:** http://localhost:5174/developer
- **App (sign up / sign in):** http://localhost:5173 — set via `VITE_APP_URL`
- **Playground API target:** `VITE_API_URL` (default `http://localhost:3000`)

## Brand

Uses Fieldmark tokens from `docs/BRAND.md`. Dale and logo images live in `public/images/` (copied from `client/public/images/`).

## Build

```bash
npm run build
npm run preview
```

Deploy `dist/` to any static host (Netlify, Vercel, S3, etc.).
