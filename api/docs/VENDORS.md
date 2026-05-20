# Vendor network

## Business model (summary)

See [docs/BUSINESS_MODEL.md](../../docs/BUSINESS_MODEL.md) for the full picture.

| Revenue | Amount | Notes |
|---------|--------|--------|
| **Directory inclusion** | **$100/month** | Required to appear in the vendor directory (`VendorListingPlan::BASE_LISTING_CENTS`) |
| **Promotional upgrades** | Varies | Featured / premium placement, sponsored campaigns, lead fees — on top of base listing |
| **Revenue share** | Partner-specific | Many vendors agree to profit/rev share on attributed sales; terms in `billing_notes` |

D.A.L.E. does **not** recommend vendors by name in chat. The directory and contextual category panels are separate from the independent analyst.

---

## Listing tiers (placement)

| Tier | Placement |
|------|-----------|
| standard | Alphabetical in category (requires active $100/mo listing) |
| featured | Above standard in category |
| premium | Top of category + contextual panels |

Set `sponsored: true` for Partner badge. Use `billing_notes` for rev-share terms and `monthly_listing_cents` for contracted listing amount (default **10000** = $100/mo).

---

## Seeds

Real businesses for southeast Missouri are in `db/seeds/vendors_cape_girardeau.json`, sourced from public web listings (see `sources` and `verified_on` in that file). Fieldmark does not endorse vendors — verify contacts before outreach.

```bash
bin/rails vendors:seed   # upserts JSON; deactivates removed slugs
bin/rails admin:seed     # admin@fieldmark.app
```

---

## Admin API

`Authorization: Bearer <admin JWT>` — CRUD `/api/v1/admin/vendors`.

---

## Farmer API

- `GET /api/v1/vendors?county=&category=&region=` — each vendor includes `favorited`, `has_profile`
- `GET /api/v1/vendors/:id_or_slug` — full partner profile (`profile_summary`, `offerings`, `latitude`, `longitude`, `full_address`)
- `GET /api/v1/vendor_recommendations?farm_id=&scenario_id=` — category-level suggestions when costs exceed peers (vendors listed in panel; Dale does not name them in chat)
- `GET /api/v1/vendor_contacts` — user's favorited vendors
- `POST /api/v1/vendor_contacts` — favorite (body: `{ vendor_contact: { vendor_id } }`)
- `DELETE /api/v1/vendor_contacts/:id` — unfavorite by contact id
- `DELETE /api/v1/vendor_contacts/by_vendor/:vendor_id` — unfavorite by vendor id
