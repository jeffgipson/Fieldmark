# Benchmark Data Pipeline

This document outlines the process for scraping, validating, and seeding benchmark data for the Fieldmark application.

## Rake Tasks

The following rake tasks are available to manage the benchmark data pipeline:

- `benchmarks:scrape`: Scrapes MU Extension budgets, validates the data, and writes it to `db/seeds/benchmark_data.json`.
- `benchmarks:nass`: Fetches USDA NASS yield data and writes it to `db/seeds/usda_yield_data.json`. Requires a `NASS_API_KEY` in your `.env` file.
- `benchmarks:generate_peers`: Generates synthetic peer farm data and writes it to `db/seeds/peer_farms.json`.

## Data Lineage

1.  **Scraping**: The `benchmarks:scrape` task fetches data from MU Extension PDFs and the MU Extension budgets index page.
2.  **Validation**: The scraped data is validated to ensure its integrity.
3.  **JSON Storage**: The validated data is stored in JSON files in the `db/seeds/` directory.
4.  **Seeding**: The `db:seed` task reads the JSON files and populates the `benchmark_regions` and `farms` tables.

## Statewide vs. Cohort Multipliers

- **Statewide Data**: The MU Extension budgets are statewide budgets. The same numbers are used for all regions (`northern`, `central`, `southwest`).
- **Cohort Multipliers**: Regional multipliers are applied only to the synthetic cohort farms, not to the official MU benchmark data.
