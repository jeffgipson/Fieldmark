# Vendor network

## Listing tiers

| Tier | Placement |
|------|-----------|
| standard | Alphabetical in category |
| featured | Above standard in category |
| premium | Top of category + contextual panels |

Set `sponsored: true` for Partner badge. Use `billing_notes` and `monthly_listing_cents` for ops (Stripe in Phase 2).

## Seeds

Real businesses for southeast Missouri are in `db/seeds/vendors_cape_girardeau.json`, sourced from public web listings (see `sources` and `verified_on` in that file). Fieldmark does not endorse vendors — verify contacts before outreach.

```bash
bin/rails vendors:seed   # upserts JSON; deactivates removed slugs
bin/rails admin:seed     # admin@fieldmark.app
```

## Admin API

`Authorization: Bearer <admin JWT>` — CRUD `/api/v1/admin/vendors`.

## Farmer API

- `GET /api/v1/vendors?county=&category=&region=` — each vendor includes `favorited`, `has_profile`
- `GET /api/v1/vendors/:id_or_slug` — full partner profile (`profile_summary`, `offerings`, `latitude`, `longitude`, `full_address`)
- `GET /api/v1/vendor_recommendations?farm_id=&scenario_id=` — nested vendors include `favorited`
- `GET /api/v1/vendor_contacts` — user's favorited vendors
- `POST /api/v1/vendor_contacts` — favorite (body: `{ vendor_contact: { vendor_id } }`)
- `DELETE /api/v1/vendor_contacts/:id` — unfavorite by contact id
- `DELETE /api/v1/vendor_contacts/by_vendor/:vendor_id` — unfavorite by vendor id

Dale does not recommend vendors by name.
