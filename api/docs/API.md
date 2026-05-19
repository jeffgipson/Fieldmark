# Fieldmark API Reference (v1)

Rails 8 JSON API for farm financial planning. All versioned endpoints live under `/api/v1`.

**Base URL (development):** `http://localhost:3000`

**Content-Type:** `application/json` for all request bodies.

**Smoke test:** Run `bin/test_api` from the `api/` directory against a running server.

---

## Table of Contents

1. [Admin API](#admin-api)
2. [Response Format](#response-format)
3. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Health](#health)
5. [Auth Endpoints](#auth-endpoints)
6. [Benchmarks](#benchmarks)
7. [Farms](#farms)
8. [Fields](#fields)
9. [Input Costs](#input-costs)
10. [Scenarios](#scenarios)
11. [Season snapshots](#season-snapshots)
12. [Peer Comparison](#peer-comparison)
13. [Analyst Conversations & Messages](#analyst-conversations--messages)
14. [Analyst Reports](#analyst-reports)
15. [Decisions](#decisions)
16. [Enumerations](#enumerations)
17. [Recommended Client Flow](#recommended-client-flow)
18. [Errors & HTTP Status Codes](#errors--http-status-codes)

---

## Admin API

Admin endpoints are available under `/api/v1/admin` for users with the `admin` role.

### `GET /api/v1/admin/stats`

Returns a count of major resources.

### Users

- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id`
- `DELETE /api/v1/admin/users/:id`

### Farms

- `GET /api/v1/admin/farms`
- `POST /api/v1/admin/farms` (requires `user_id`)
- `GET /api/v1/admin/farms/:id`
- `PATCH /api/v1/admin/farms/:id`
- `DELETE /api/v1/admin/farms/:id`

### Vendors

The existing vendor admin API is available at `/api/v1/admin/vendors`.

---

## Response Format

Every endpoint returns a consistent envelope.

### Success

```json
{
  "data": { },
  "meta": { },
  "errors": []
}
```

- `data` — payload (object or array).
- `meta` — optional metadata. Paginated list endpoints include `page`, `per_page`, and `total`.
- `errors` — always an empty array on success.

### Error

```json
{
  "data": null,
  "meta": {},
  "errors": [
    { "field": "email", "message": "has already been taken" }
  ]
}
```

- `errors` — array of `{ field, message }` objects.
- `field` — attribute name, logical key (e.g. `credentials`), or `base` for general errors.

### Pagination

List endpoints accept query params:

| Param      | Default | Description        |
|------------|---------|--------------------|
| `page`     | `1`     | Page number        |
| `per_page` | `25`    | Items per page     |

Example `meta`:

```json
{ "page": 1, "per_page": 25, "total": 3 }
```

---

## Authentication

Protected endpoints require a JWT issued by Devise JWT on login or register.

**Header:**

```
Authorization: Bearer <token>
```

- Token is returned in `data.token` on successful register and login.
- Logout (`DELETE /api/v1/auth/logout`) revokes the token via the JWT denylist.
- Unauthenticated requests to protected routes return `401 Unauthorized`.
- All resource queries are scoped to the current user’s farms. Admin users (`role: admin`) can access all farms.

---

## Rate Limiting

Rack::Attack throttles auth endpoints:

| Endpoint                         | Limit              |
|----------------------------------|--------------------|
| `POST /api/v1/auth/login`        | 10 requests/min/IP |
| `POST /api/v1/auth/register`     | 10 requests/min/IP |

Throttled requests return `429 Too Many Requests`.

---

## Health

### `GET /api/health`

No authentication required.

**Response `200`:**

```json
{
  "data": { "status": "ok" },
  "meta": {},
  "errors": []
}
```

---

## Auth Endpoints

### `POST /api/v1/auth/register`

Create a new farmer account. Returns user profile and JWT.

**Request body:**

```json
{
  "user": {
    "email": "mike@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "first_name": "Mike",
    "last_name": "Henderson"
  }
}
```

**Response `201` — `data`:**

| Field        | Type   | Description                    |
|--------------|--------|--------------------------------|
| `id`         | integer| User ID                        |
| `email`      | string |                                |
| `first_name` | string | Required                       |
| `last_name`  | string | Required                       |
| `role`       | string | `farmer` (default) or `admin`  |
| `token`      | string | JWT for subsequent requests    |

---

### `POST /api/v1/auth/login`

**Request body:**

```json
{
  "user": {
    "email": "mike@example.com",
    "password": "password123"
  }
}
```

**Response `200`:** Same shape as register (`data` includes `token`).

**Response `401`:**

```json
{
  "data": null,
  "meta": {},
  "errors": [{ "field": "credentials", "message": "Invalid email or password." }]
}
```

---

### `DELETE /api/v1/auth/logout`

Requires `Authorization: Bearer <token>`.

**Response `200`:**

```json
{
  "data": { "message": "Logged out successfully." },
  "meta": {},
  "errors": []
}
```

---

## Benchmarks

Regional cost data seeded from University of Missouri Extension 2026 crop budgets.

### `GET /api/v1/benchmarks`

**Query parameters (required unless noted):**

| Param       | Required | Example   | Description                          |
|-------------|----------|-----------|--------------------------------------|
| `region`    | yes      | `central` | `northern`, `central`, `southwest`   |
| `commodity` | yes      | `corn`    | `corn` or `soybean`                  |
| `year`      | no       | `2026`    | Defaults to current calendar year    |

**Response `200` — `data`:**

| Field                          | Type    | Description ($/acre)     |
|--------------------------------|---------|--------------------------|
| `id`                           | integer |                          |
| `region`                       | string  |                          |
| `commodity`                    | string  |                          |
| `season_year`                  | integer |                          |
| `seed_cost_per_acre`           | decimal |                          |
| `fertilizer_cost_per_acre`     | decimal |                          |
| `chemicals_cost_per_acre`      | decimal |                          |
| `labor_cost_per_acre`          | decimal |                          |
| `total_operating_cost_per_acre`| decimal |                          |
| `total_cost_per_acre`          | decimal | Includes ownership       |
| `assumed_yield`                | decimal | bu/acre                  |
| `assumed_price`                | decimal | $/bu                     |
| `source`                       | string  | e.g. MU Extension 2026   |

**Response `404`:** No benchmark for the given filters.

**Seeded reference values (2026, all regions):**

| Category              | Corn ($/ac) | Soybean ($/ac) |
|-----------------------|------------:|---------------:|
| Seed                  | 99.38       | 75.00          |
| Fertilizer            | 187.01      | 91.28          |
| Chemicals             | 104.00      | 113.25         |
| Labor                 | 22.60       | 11.52          |
| Total operating       | 600.07      | 387.69         |
| Total w/ ownership    | 902.47      | 642.57         |

Assumed yields/prices: corn 176 bu/ac @ $4.33/bu; soybean 57 bu/ac @ $10.43/bu.

---

## Farms

### `GET /api/v1/farms`

List farms for the current user (paginated).

### `GET /api/v1/farms/:id`

### `POST /api/v1/farms`

### `PATCH /api/v1/farms/:id`

### `DELETE /api/v1/farms/:id`

### `GET /api/v1/farms/:id/underwriting`

Deterministic lender / crop-insurance **file read** (not a loan approval or insurance quote). Aggregates map coverage, field hazards, scenario margins, peer benchmarks, macro drivers, and forecast into five pillars with favorable / watch / concern factors.

**Query params:** `scenario_id` (optional) — scenario used for margin, sensitivity, and peer context.

**Response `data`:** `rating` (`favorable` | `moderate` | `elevated` | `insufficient_data`), `rating_label`, `confidence`, `summary`, `pillars[]` (each with `factors[]`), `concern_count`, `watch_count`, `disclaimer`, `scored_at`.

Included in Dale `context_snapshot` as `underwriting`.

---

### `GET /api/v1/farms/:id/summary`

Farm financial rollup for the planning season: mapped acres, weighted operating costs, per-field cost breakdown, optional scenario margin snapshot, peer headline, and regional risk context.

**Query params:** `scenario_id` (optional) — scenario to include in `scenario_snapshot`; defaults to first calculated scenario on the farm.

**Response `data`:**

```json
{
  "season_year": 2026,
  "mapped_acres": 1200.0,
  "profile_acres": 1200.0,
  "acres_reconciled": true,
  "acres_delta": 0.0,
  "operating_costs": {
    "seed": 99.38,
    "fertilizer": 187.01,
    "chemicals": 45.0,
    "labor": 12.0,
    "custom_hire": 0.0,
    "other": 0.0,
    "total_operating": 343.39
  },
  "total_operating_dollars": 412068.0,
  "fields": [
    {
      "field_id": 1,
      "name": "North 40",
      "acres": 40.0,
      "primary_commodity": "corn",
      "operating_cost_per_acre": 350.0,
      "total_operating_dollars": 14000.0,
      "cost_categories": { "seed": 100.0, "fertilizer": 150.0 }
    }
  ],
  "scenario_snapshot": {
    "scenario_id": 1,
    "scenario_name": "Base Case",
    "base_case": { "margin_per_acre": 420.0, "total_margin": 504000.0 },
    "downside_case": { "margin_per_acre": 180.0, "total_margin": 216000.0 },
    "by_field": [],
    "field_outliers": {}
  },
  "peer_headline": "fertilizer $12.50/ac above vs MU benchmark",
  "regional_risk": { "region": "central", "message": "...", "note": "..." }
}
```

**Request body (create/update):**

```json
{
  "farm": {
    "name": "Henderson Family Farm",
    "total_acres": 1200,
    "county": "Cape Girardeau",
    "region": "central",
    "primary_commodity": "corn"
  }
}
```

| Attribute           | Type    | Required | Values / notes                              |
|---------------------|---------|----------|---------------------------------------------|
| `name`              | string  | yes      |                                             |
| `total_acres`       | decimal | yes      | > 0                                         |
| `county`            | string  | yes      |                                             |
| `region`            | string  | yes      | `northern`, `central`, `southwest`          |
| `primary_commodity` | string  | yes      | `corn`, `soybean`, `both`                   |

**Response — `data` (single farm):**

```json
{
  "id": 1,
  "name": "Henderson Family Farm",
  "total_acres": "1200.0",
  "county": "Cape Girardeau",
  "region": "central",
  "primary_commodity": "corn",
  "created_at": "2026-05-19T01:00:00.000Z",
  "updated_at": "2026-05-19T01:00:00.000Z"
}
```

**Delete response:** `{ "id": <deleted_id> }`

---

## Fields

Nested under farms: `/api/v1/farms/:farm_id/fields`

### `GET /api/v1/farms/:farm_id/fields`

### `GET /api/v1/farms/:farm_id/fields/:id`

### `POST /api/v1/farms/:farm_id/fields`

### `PATCH /api/v1/farms/:farm_id/fields/:id`

### `DELETE /api/v1/farms/:farm_id/fields/:id`

**Request body:**

```json
{
  "field": {
    "name": "North 80",
    "acres": 80,
    "soil_type": "Silt loam",
    "primary_commodity": "corn"
  }
}
```

| Attribute           | Type    | Required | Values                    |
|---------------------|---------|----------|---------------------------|
| `name`              | string  | yes      |                           |
| `acres`             | decimal | yes      | > 0                       |
| `soil_type`         | string  | yes      |                           |
| `primary_commodity` | string  | yes      | `corn`, `soybean`         |

**Response includes `farm_id`.**

---

## Input Costs

Per-field costs for a season. Nested under fields: `/api/v1/fields/:field_id/input_costs`

### `GET /api/v1/fields/:field_id/input_costs`

Returns all costs for the field (not paginated), ordered by `season_year` desc, `category` asc.

### `POST /api/v1/fields/:field_id/input_costs`

### `PATCH /api/v1/fields/:field_id/input_costs/:id`

### `DELETE /api/v1/fields/:field_id/input_costs/:id`

**Request body:**

```json
{
  "input_cost": {
    "season_year": 2026,
    "category": "seed",
    "amount_per_acre": 105.50,
    "notes": "Premium hybrid"
  }
}
```

| Attribute          | Type    | Required | Values / notes                                      |
|--------------------|---------|----------|-----------------------------------------------------|
| `season_year`      | integer | yes      | > 2000; calculations use current year by default    |
| `category`         | string  | yes      | See [Input cost categories](#input-cost-categories) |
| `amount_per_acre`  | decimal | yes      | ≥ 0                                                 |
| `notes`            | string  | no       |                                                     |

**Response includes `field_id`.**

---

## Scenarios

What-if margin modeling for a farm. Nested under farms: `/api/v1/farms/:farm_id/scenarios`

### `GET /api/v1/farms/:farm_id/scenarios`

### `GET /api/v1/farms/:farm_id/scenarios/:id`

### `POST /api/v1/farms/:farm_id/scenarios`

### `PATCH /api/v1/farms/:farm_id/scenarios/:id`

### `DELETE /api/v1/farms/:farm_id/scenarios/:id`

**Request body:**

```json
{
  "scenario": {
    "name": "Base Case 2026",
    "commodity_price": 4.33,
    "yield_assumption": 176,
    "downside_commodity_price": 3.80,
    "downside_yield": 160
  }
}
```

| Attribute                  | Type    | Required | Notes                          |
|----------------------------|---------|----------|--------------------------------|
| `name`                     | string  | yes      |                                |
| `commodity_price`          | decimal | no*      | Base case price ($/bu)         |
| `yield_assumption`         | decimal | no*      | Base case yield (bu/acre)      |
| `downside_commodity_price` | decimal | no*      | Downside price ($/bu)          |
| `downside_yield`           | decimal | no*      | Downside yield (bu/acre)       |
| `planning_mode`            | string  | no       | `forward` (default) or `goal`  |
| `target_total_margin`      | decimal | no       | Goal mode: target farm net ($) |
| `target_margin_per_acre`   | decimal | no       | Goal mode: target net $/ac (alternative to total) |
| `projection_years`         | array   | no       | Optional per-year overrides (see below) |

\* If present, must be > 0. Both price and yield are required for each case to compute margins.

**`projection_years` entries** (optional JSON array on create/update):

| Key                         | Type    | Notes                                      |
|-----------------------------|---------|--------------------------------------------|
| `season_year`               | integer | Planning year for this override              |
| `commodity_price`           | decimal | Base price for that year                     |
| `yield_assumption`          | decimal | Base yield for that year                     |
| `operating_escalation_pct`  | decimal | Override MU trend escalation for that year   |

**Response includes `results` (JSONB, populated by `calculate`).**

---

### `POST /api/v1/farms/:farm_id/scenarios/:id/calculate`

Runs `ScenarioCalculatorService`, persists `results` on the scenario, and returns the updated scenario.

**Query params:** `apply_macro` (optional boolean) — when true, includes suggested diesel/fertilizer stress-test bumps in farm margin results (`results.macro_adjustments`); does not change stored `input_costs`.

**Response `200` — `data.results` shape:**

```json
{
  "season_year": 2026,
  "weighted_costs_per_acre": {
    "seed": 105.5,
    "fertilizer": 195.0
  },
  "base_case": {
    "revenue_per_acre": 762.08,
    "operating_cost_per_acre": 300.5,
    "margin_per_acre": 461.58,
    "total_margin": 55389.6,
    "total_acres": 120.0
  },
  "downside_case": {
    "revenue_per_acre": 608.0,
    "operating_cost_per_acre": 300.5,
    "margin_per_acre": 307.5,
    "total_margin": 36900.0,
    "total_acres": 120.0
  },
  "by_field": [
    {
      "field_id": 1,
      "field_name": "North 80",
      "acres": 80.0,
      "operating_cost_per_acre": 415.5,
      "base_case": { "margin_per_acre": 346.93, "total_margin": 27754.0 },
      "downside_case": { "margin_per_acre": 192.5, "total_margin": 15400.0 },
      "share_of_farm_base_margin": 42.5
    }
  ],
  "field_outliers": {
    "lowest_base_margin_field_id": 2,
    "highest_base_margin_field_id": 1,
    "base_margin_spread_per_acre": 85.0
  },
  "macro_adjustments": null,
  "target_plan": {
    "target_total_margin": 75000.0,
    "target_margin_per_acre": 450.0,
    "gap_margin_per_acre": 85.0,
    "paths": [
      {
        "key": "commodity_price",
        "label": "Commodity price",
        "required_value": 4.85,
        "unit": "$/bu",
        "detail": "Need commodity price of $4.85/bu at your 176.0 bu/ac yield."
      }
    ]
  },
  "forecast": {
    "base_year": 2026,
    "horizon_years": 3,
    "annual_operating_escalation_pct": 2.1,
    "years": [
      {
        "season_year": 2026,
        "operating_cost_per_acre": 415.5,
        "margins": {
          "p25": { "total_margin": 48000.0, "margin_per_acre": 400.0 },
          "base": { "total_margin": 55389.6, "margin_per_acre": 461.58 },
          "p75": { "total_margin": 62000.0, "margin_per_acre": 516.67 }
        },
        "downside": { "total_margin": 36900.0, "margin_per_acre": 307.5 }
      }
    ],
    "feedback": [],
    "disclaimer": "Forward years use benchmark trend and your scenario assumptions — planning bands, not market guarantees."
  },
  "calculated_at": "2026-05-19T12:00:00Z"
}
```

- `weighted_costs_per_acre` — acre-weighted average across all fields for the current season year.
- `base_case` / `downside_case` — `null` if the scenario is missing the required price/yield pair for that case.
- `forecast` — three-year margin bands from `ForecastProjectionService` (p25/base/p75 and downside per year).
- Category keys in `weighted_costs_per_acre` match input cost categories (string keys).

### `GET /api/v1/farms/:farm_id/scenarios/:id/forecast`

Returns the same `forecast` object as in `calculate` results without re-running the full calculator. Useful when refreshing the timeline after season snapshots change.

**Response `200`:** `data` is the forecast payload (not the full scenario).

---

## Season snapshots

Closed-book actuals per farm per planning year. Used to compare plan vs reality and to populate Dale feedback on the next season’s forecast.

Nested under farms: `/api/v1/farms/:farm_id/season_snapshots`

### `GET /api/v1/farms/:farm_id/season_snapshots`

List snapshots for the farm (newest `season_year` first).

### `POST /api/v1/farms/:farm_id/season_snapshots`

### `PATCH /api/v1/farms/:farm_id/season_snapshots/:id`

### `DELETE /api/v1/farms/:farm_id/season_snapshots/:id`

**Request body:**

```json
{
  "farm_season_snapshot": {
    "season_year": 2025,
    "actual_yield": 168.0,
    "actual_price": 4.12,
    "actual_total_operating_per_acre": 428.5,
    "notes": "Dry August on river bottom",
    "source": "farmer_entered"
  }
}
```

| Attribute                         | Type    | Required | Notes                          |
|-----------------------------------|---------|----------|--------------------------------|
| `season_year`                     | integer | yes      | Unique per farm                |
| `actual_yield`                    | decimal | no       | bu/ac (farm-weighted average)  |
| `actual_price`                    | decimal | no       | $/bu                           |
| `actual_total_operating_per_acre` | decimal | no       | $/ac operating                 |
| `notes`                           | string  | no       |                                |
| `source`                          | string  | no       | `farmer_entered` or `import`   |

---

## Peer Comparison

### `POST /api/v1/farms/:farm_id/scenarios/:id/compare`

Runs `PeerComparisonService`: compares the farm’s weighted input costs to **MU Extension benchmarks** and **anonymized peer farms** in the same region and commodity cohort (minimum 5 farms). Includes farm-level categories, per-field peer stats, and margin distribution when scenarios are calculated.

**No request body.**

**Response `200` — `data`:** scenario fields plus nested `peer_comparison`:

```json
{
  "id": 1,
  "farm_id": 1,
  "name": "Base Case 2026",
  "results": { },
  "peer_comparison": {
    "id": 1,
    "scenario_id": 1,
    "benchmark_region_id": 2,
    "seed_percentile": 68.0,
    "fertilizer_percentile": 72.5,
    "chemicals_percentile": 55.0,
    "total_cost_percentile": 61.0,
    "summary": {
      "user_costs_per_acre": { "seed": 105.5, "fertilizer": 198.0, "chemicals": 112.0, "labor": 0, "total": 415.5 },
      "benchmark_costs_per_acre": { "seed": 99.38, "fertilizer": 187.01, "chemicals": 104.0, "labor": 22.6, "total": 600.07 },
      "peer_costs_per_acre": { "seed": 102.0, "fertilizer": 192.5, "chemicals": 105.0, "labor": 0, "total": 399.5 },
      "cohort": {
        "available": true,
        "size": 62,
        "region": "central",
        "commodity": "corn",
        "season_year": 2026,
        "source": "fieldmark_peers"
      },
      "categories": {
        "seed": {
          "user_per_acre": 105.5,
          "benchmark_per_acre": 99.38,
          "peer_median_per_acre": 102.0,
          "difference_vs_benchmark_per_acre": 6.12,
          "difference_vs_peer_per_acre": 3.5,
          "peer_percentile": 68.0,
          "flag_vs_benchmark": "at_average",
          "flag_vs_peer": "at_average"
        }
      },
      "field_comparisons": [],
      "margin_comparison": {
        "available": true,
        "cohort_size": 58,
        "user_base_margin_per_acre": 130.0,
        "peer_median_base_margin_per_acre": 138.0,
        "base_margin_peer_percentile": 45.0
      },
      "total_acres": 80,
      "compared_at": "2026-05-19T12:00:00Z"
    }
  }
}
```

**Percentile interpretation:** Top-level `*_percentile` columns and `categories.*.peer_percentile` are **true rank-based percentiles** within the anonymized peer cohort (0 = lowest cost, 100 = highest). When `cohort.available` is false, peer fields are omitted and only MU Extension comparison is returned. Requires fields with input costs for `CurrentSeason.year`.

---

## Analyst Conversations & Messages

AI chat backed by Claude. Requires `ANTHROPIC_API_KEY` in the server environment.

### `POST /api/v1/conversations`

Start a conversation with a frozen context snapshot of the farm (and optional scenario).

**Request body:**

```json
{
  "conversation": {
    "farm_id": 1,
    "scenario_id": 1
  }
}
```

| Attribute     | Required | Notes                                      |
|---------------|----------|--------------------------------------------|
| `farm_id`     | yes      | Must belong to current user                |
| `scenario_id` | no       | If set, includes scenario + peer data    |

**Response `201` — `data`:**

| Field              | Type   | Description                              |
|--------------------|--------|------------------------------------------|
| `id`               | integer|                                          |
| `farm_id`          | integer|                                          |
| `scenario_id`      | integer| nullable                                 |
| `context_snapshot` | object | Farm, fields, costs, scenario snapshot   |
| `created_at`       | string | ISO 8601                                 |
| `updated_at`       | string | ISO 8601                                 |

---

### `GET /api/v1/conversations/:id`

Returns conversation with `messages` array ordered by `created_at`.

**Message object:**

| Field         | Type    | Description              |
|---------------|---------|--------------------------|
| `id`          | integer |                          |
| `role`        | string  | `user` or `assistant`    |
| `content`     | string  |                          |
| `token_count` | integer | nullable                 |
| `created_at`  | string  |                          |
| `updated_at`  | string  |                          |

---

### `POST /api/v1/conversations/:conversation_id/messages`

Send a user message; server calls Claude and returns both messages.

**Request body:**

```json
{
  "message": {
    "content": "How does my seed cost compare to peers?"
  }
}
```

**Response `201` — `data`:**

```json
{
  "user_message": { "id": 1, "role": "user", "content": "...", "token_count": null },
  "assistant_message": { "id": 2, "role": "assistant", "content": "...", "token_count": 1234 }
}
```

**Error responses:**

| Status | `field`    | When                                      |
|--------|------------|-------------------------------------------|
| `503`  | `anthropic`| `ANTHROPIC_API_KEY` not configured        |
| `502`  | `anthropic`| Anthropic API error                       |

---

## Analyst Reports

### `POST /api/v1/scenarios/:scenario_id/report`

Generates (or replaces) a lender-ready report via Claude. Idempotent per scenario — updates existing report if present.

**No request body.**

**Response `201` — `data`:**

| Field               | Type   | Description                          |
|---------------------|--------|--------------------------------------|
| `id`                | integer|                                      |
| `scenario_id`       | integer|                                      |
| `summary`           | string | Executive summary                    |
| `key_findings`      | array  | Strings                              |
| `recommendations`   | array  | Strings                              |
| `risk_flags`        | array  | Strings                              |
| `lender_narrative`  | string | Full narrative for lender sharing    |
| `generated_at`      | string | ISO 8601                             |

Same `503`/`502` anthropic errors as messages.

---

## Decisions

Log the farmer’s final call for a scenario. One decision per scenario.

### `POST /api/v1/scenarios/:scenario_id/decision`

### `PATCH /api/v1/scenarios/:scenario_id/decision`

### `PUT /api/v1/scenarios/:scenario_id/decision`

**Request body:**

```json
{
  "decision": {
    "decision_type": "proceed",
    "notes": "Margins acceptable at base case.",
    "decided_at": "2026-03-15T10:00:00Z",
    "actual_outcome": null
  }
}
```

| Attribute        | Type   | Required | Notes                                      |
|------------------|--------|----------|--------------------------------------------|
| `decision_type`  | string | yes      | `proceed`, `wait`, `modify`, `cancel`      |
| `notes`          | string | no       |                                            |
| `decided_at`     | string | no       | Defaults to server time on create          |
| `actual_outcome` | string | no       | Post-season notes                          |

**Create errors:**

| Status | Message                                              |
|--------|------------------------------------------------------|
| `422`  | Decision already exists for this scenario.           |
| `404`  | No decision found (update only).                     |

---

## Enumerations

Rails stores these as integers; the API returns string keys.

### Farm `region`

`northern`, `central`, `southwest`

### Farm `primary_commodity`

`corn`, `soybean`, `both`

### Field `primary_commodity`

`corn`, `soybean`

### Input cost categories

`seed`, `fertilizer`, `chemicals`, `labor`, `custom_hire`, `other`

### User `role`

`farmer` (default), `admin`

### Decision `decision_type`

`proceed`, `wait`, `modify`, `cancel`

### Analyst message `role`

`user`, `assistant`

---

## Recommended Client Flow

Typical demo / production journey:

```
1. POST /api/v1/auth/register
2. POST /api/v1/farms
3. POST /api/v1/farms/:farm_id/fields
4. POST /api/v1/fields/:field_id/input_costs  (per category)
5. GET  /api/v1/benchmarks?region=...&commodity=...&year=2026
6. POST /api/v1/farms/:farm_id/scenarios
7. POST /api/v1/farms/:farm_id/scenarios/:id/calculate
8. POST /api/v1/farms/:farm_id/scenarios/:id/compare
9. POST /api/v1/conversations  { farm_id, scenario_id }
10. POST /api/v1/conversations/:id/messages  (repeat as needed)
11. POST /api/v1/scenarios/:scenario_id/report
12. POST /api/v1/scenarios/:scenario_id/decision
```

---

## Errors & HTTP Status Codes

| Status | Meaning                                      |
|--------|----------------------------------------------|
| `200`  | Success                                      |
| `201`  | Created                                      |
| `401`  | Missing/invalid JWT or bad login credentials |
| `404`  | Resource not found or not owned by user        |
| `422`  | Validation failed (`errors` array populated) |
| `429`  | Auth rate limit exceeded                     |
| `502`  | Anthropic API failure                        |
| `503`  | Anthropic not configured on server           |

**Authorization scoping:** `Farm.find(id)` is never used directly. Controllers resolve resources through `current_user.farms` (or all farms for admins). A valid JWT for user A cannot access user B’s `farm_id`.

---

## Environment Variables (server)

| Variable            | Required | Description                          |
|---------------------|----------|--------------------------------------|
| `ANTHROPIC_API_KEY` | For AI   | Claude API key                       |
| `JWT_SECRET_KEY`    | yes      | JWT signing secret                   |
| `DATABASE_URL`      | prod     | PostgreSQL connection                |
| `CORS_ORIGINS`      | no       | Comma-separated origins (default Vite dev server) |
| `REDIS_URL`         | jobs     | Background job adapter               |

See `api/.env.example` for a template.
