# Fieldmark business model

Fieldmark has **two-sided revenue**: farmers pay for independent planning tools; vendors pay for directory access, promotion, and (where contracted) a share of attributed sales.

**Independence rule:** D.A.L.E. does not recommend vendors by name in chat. Farmer analysis uses MU Extension benchmarks and anonymized peer data. Vendor monetization is separate from the analyst — farmers subscribe for data; vendors pay for visibility and referrals.

---

## 1. Farmer subscriptions (SaaS)

Recurring monthly plans for the farmer app (`SubscriptionPlan`).

| Plan | Price | Entitlements |
|------|-------|----------------|
| **Basic** | **$30/mo** | 1 farm, up to 5 fields — benchmarks, peer compare, scenarios, D.A.L.E., lender reports |
| **Pro** | **$50/mo** | Multiple farms, unlimited fields |

- Billing: Stripe (mock in dev via `BILLING_MOCK=true`).
- API: `GET /api/v1/billing`, `POST /api/v1/billing/checkout`.
- Code: `api/app/models/subscription_plan.rb`, `client/src/constants/billing.js`, `website/src/constants/pricing.js`.

---

## 2. Vendor directory & promotions

Vendors (seed dealers, co-ops, lenders, applicators, etc.) pay to reach farmers who are already comparing costs before March commitments.

### Base listing — **$100/month**

Every vendor **included in the directory** pays **$100/month** (`VendorListingPlan::BASE_LISTING_CENTS`). This is the cost of a profile in county/category search, favoriting, and contextual recommendation *categories* (not named pushes from D.A.L.E.).

Tracked on the vendor record: `monthly_listing_cents` (default **10_000** when unset). Ops notes: `billing_notes`.

### Promotional opportunities (add-ons)

On top of the base listing fee, vendors can buy better placement and campaigns:

| Product | Purpose | Reference pricing (ops) |
|---------|---------|-------------------------|
| **Featured** | Sort above standard listings in category | +$99/mo (`featured_placement`) |
| **Premium** | Top of category + contextual panels | +$199/mo (`premium_placement`) |
| **Sponsored / Partner** | Partner badge, `sponsored: true`, campaign slots | +$49/campaign (`sponsored_campaign`) |
| **Lead referral** | Fee when a farmer contact is attributed | $25/lead (`LEAD_REFERRAL_CENTS`) |

Listing tiers in the app (`standard`, `featured`, `premium`) control sort order and UI prominence. See `api/docs/VENDORS.md` and `api/app/models/vendor.rb`.

### Revenue share on vendor sales

For **many** vendor partners, Fieldmark also takes a **profit / revenue share** on sales attributed to the platform (referrals, tracked offers, or closed-loop reporting). Terms are **per-vendor** — percentage and categories vary by partner — and recorded in admin `billing_notes` until automated attribution ships.

This is **not** the primary farmer product; it is a B2B line item alongside listing and promotion fees. Admin payments dashboard simulates `revenue_share` payouts in mock mode.

---

## 3. How the sides fit together

```
Farmers ($30–50/mo)          Vendors ($100/mo + promos + rev share)
        │                              │
        ▼                              ▼
  Independent planning          Directory & referrals
  MU benchmarks + peers         (Dale stays vendor-neutral)
  D.A.L.E. + lender reports
```

| Stakeholder | Pays for | Does not pay for |
|-------------|----------|------------------|
| **Farmer** | Benchmarks, scenarios, AI analyst, reports | Input products; vendor placement |
| **Vendor** | Listing, promotion, optional rev share on sales | Farmer subscriptions |

---

## 4. Implementation status (MVP)

| Stream | Status |
|--------|--------|
| Farmer subscriptions | Product logic + mock Stripe; live Stripe when configured |
| Vendor $100/mo listing | Documented + `VendorListingPlan`; seed/admin use `monthly_listing_cents` |
| Promotional tiers | UI sort + admin CRUD; mock payment types in admin dashboard |
| Revenue share | Business terms in `billing_notes`; automated settlement planned |

Code references: `api/app/services/billing/`, `api/app/services/admin/mock_stripe_dashboard.rb`, `frontend/admin` Payments page.

---

## 5. Related docs

- [Vendor network API](api/docs/VENDORS.md)
- [README — subscriptions](../README.md)
- [Judge review — independence vs. vendor surface](JUDGE_REVIEW.md)
