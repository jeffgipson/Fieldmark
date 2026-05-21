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
- **Blog:** http://localhost:5174/blog
- **API docs & playground:** http://localhost:5174/developer
- **App (sign up / sign in):** http://localhost:5173 — set via `VITE_APP_URL`
- **Playground API target:** `VITE_API_URL` (default `http://localhost:3000`)

## Brand

Uses Fieldmark tokens from `docs/BRAND.md`. Dale and logo images live in `public/images/` (copied from `client/public/images/`).

## Blog (content marketing)

Seed content lives in `src/data/blog/` — categories, tags, and 10 posts aligned with `docs/MARKETING_PLAN.md` SEO targets. Edit `src/data/blog/posts.js` to add or update articles. Cover images: `public/images/blog/` (AI-generated PNG heroes, 1200px wide).

Routes: `/blog` (listing with category/tag filters) · `/blog/:slug` (single post)

## Build

```bash
npm run build
npm run preview
```

Deploy `dist/` to any static host (Netlify, Vercel, S3, etc.).
