# DiraFair

**Is your Tel Aviv rent fair?** Compare your rent to 2,000+ real listings. Negotiate with data.

**[Live Site](https://naorbrown.github.io/dira-fair/)**

[![CI](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml/badge.svg)](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml)
[![Deploy](https://github.com/naorbrown/dira-fair/actions/workflows/deploy.yml/badge.svg)](https://github.com/naorbrown/dira-fair/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## The Problem

Israeli renters negotiate blind. Landlords know the market -- tenants don't. DiraFair answers one question: **am I overpaying?**

## What You Get

Enter your address (or neighborhood), rooms, sqm, and rent. One click returns:

- **Verdict** -- below/at/above market with exact percentage
- **Comparable listings** -- quality-weighted matches with source links
- **Interactive map** -- nearby apartments color-coded by price
- **Price distribution** -- where your rent falls in the curve
- **Negotiation tips** -- data-driven advice for your situation
- **Market signals** -- trend, season, supply, days-on-market

## Pages

| Page | What |
|------|------|
| **/** | Landing -- address autocomplete or neighborhood select, one-click rent check |
| **/check** | Results -- verdict, score card, map + comparables, tips |
| **/explore** | Browse all 2,000+ listings with map, filters, market data, decision factors |
| **/dashboard** | Market stats -- neighborhood table, trend chart, seasonal indicator |
| **/neighborhood/[slug]** | 31 neighborhood detail pages with listings, rent by room size |

## Key Design Decisions

**Israeli room count**: The living room (salon) counts as a room. "3 rooms" = 2 bedrooms + salon. The form explains this.

**Quality scoring** (0-100): Condition (25), elevator (15), parking (15), balcony (10), A/C (10), mamad (10), furniture (5), pets (5), building age (5).

**Similarity matching**: Comparables ranked by room match (30), sqm proximity (25), quality (20), floor (15), freshness (10).

**Closed market data**: The explore page shows what tenants actually pay vs. asking prices, based on CBS surveys and community data.

## Architecture

Fully static Next.js app on GitHub Pages. No runtime backend. All scoring runs client-side against embedded data.

```
Address/neighborhood + rooms + sqm + rent
  --> lib/scoring.ts (client-side)
  --> Verdict + comparables + map + tips
```

A FastAPI backend in `apps/api/` handles data collection (Yad2 scraping, CBS/nadlan fetching).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts, Leaflet |
| Scoring | Client-side TypeScript (quality-weighted percentile) |
| Data | Yad2 listings, CBS rent survey, nadlan.gov.il transactions |
| Backend | Python FastAPI, SQLModel, SQLite |
| Testing | Playwright E2E (74 tests), pytest |
| Hosting | GitHub Pages (static export), GitHub Actions CI/CD |

## Data

- **2,000+ listings** across 19 neighborhoods from 9 sources
- **31 neighborhood pages** (19 TLV + 12 surrounding cities)
- **9 quality fields** per listing
- **CBS Q1 2026** rent stats
- **24-month** rent index trend
- **Closed market data** -- asking vs. actual vs. renewal prices

## Getting Started

**Live site**: [naorbrown.github.io/dira-fair](https://naorbrown.github.io/dira-fair/)

```bash
# Local dev
cd apps/web && npm install && npm run dev

# Tests (74 Playwright e2e tests)
npm run build && npx playwright test

# Backend (optional, for data pipeline)
cd apps/api && pip install -e ".[dev]" && uvicorn api.main:app --reload
```

## Project Structure

```
dira-fair/
  apps/
    web/                    # Next.js static frontend
      app/                  # Pages (landing, check, explore, dashboard, neighborhood)
      components/           # UI (form, score card, charts, maps)
      lib/                  # Data, scoring, types, API, formatting
      e2e/                  # Playwright tests (74 tests across 5 spec files)
    api/                    # FastAPI data pipeline
  .github/workflows/       # CI + deploy
```

## License

[MIT](LICENSE)

---

*dira = apartment in Hebrew*
