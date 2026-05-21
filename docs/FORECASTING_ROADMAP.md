# Multi-Year Forecasting (Shipped)

Fieldmark ships deterministic **three-year margin forecasting** on the scenario page, backed by MU benchmark trends, optional per-year scenario overrides, and farmer-recorded season actuals.

## Shipped building blocks

| Piece | Location | Role |
|-------|----------|------|
| `farm_season_snapshots` | DB + `FarmSeasonSnapshotsController` | Closed-book actuals per farm/year |
| `scenarios.projection_years` | DB + scenario CRUD | Per-year price/yield/escalation overrides |
| `ForecastProjectionService` | `api/app/services/forecast_projection_service.rb` | 3-year p25/base/p75 + downside bands |
| `results.forecast` | Scenario calculate | Embedded in calculator output |
| `GET .../scenarios/:id/forecast` | `ScenariosController#forecast` | Standalone forecast refresh |
| Dale context | `context_snapshot_builder`, `analyst_context_findings` | Snapshots + forecast feedback in chat |
| UI | `ForecastTimelineChart`, `SeasonSnapshotsPanel`, `ScenarioRiskPanel` on scenario page | Timeline, season actuals, consolidated risk |

## How it works

```
Current scenario assumptions
  + FarmOperatingCosts (weighted $/ac)
  + MU YoY escalation (BenchmarkTrendService → macro fallback)
  + optional projection_years overrides
  + farm_season_snapshots (prior-year actuals → feedback strings)
  → 3 planning years (CurrentSeason.year .. year+2)
  → per year: operating roll-forward, price/yield bands, margin p25/base/p75, downside
```

**Rules (unchanged):**

- External drivers are **assumptions with citations**, not guaranteed outcomes.
- Weather and macro adjust **risk context** or stress tests; they do not auto-mutate `input_costs`.

## Feedback loop (shipped)

1. Farmer runs scenario before March → `calculate` persists `results` including `forecast`.
2. Logs `Decision` with notes (optional per-field notes).
3. After harvest → **Season actuals** on the scenario page (`farm_season_snapshots`).
4. Next calculate → `forecast.feedback` compares prior snapshots to plan; Dale surfaces the same in context.

## API reference

See `api/docs/API.md` — **Season snapshots** and **Scenarios** (`forecast` in calculate results, `GET .../forecast`).

## Deferred (post-MVP)

| Item | Notes |
|------|--------|
| Monte Carlo simulation | Deterministic bands only today |
| Lender report multi-year section | Report remains single-scenario focused |
| Live BLS PPI fetch | MU trend + seeded `macro_drivers` |
| ~~Live USDA drought / crop progress~~ | **Shipped:** `MarketIntelligenceService` + Perplexity Sonar → `regional_risk` (cached; static fallback) |

## Related (pre-forecasting demo)

| Piece | Role |
|-------|------|
| `BenchmarkTrendService` | YoY MU and user cost trends |
| `YieldContextService` | NASS historical yields |
| `ScenarioSensitivityService` | Price × yield margin grid |
| `MacroImpactService` | Optional diesel/fertilizer stress on calculate |
