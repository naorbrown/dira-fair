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

## Data

All data is embedded in the frontend as static TypeScript literals. No runtime API calls. The data pipeline collects, processes, and flattens data from 10 sources into the frontend bundle.

### Listing Data — 2,000 apartments from 9 sources

| Source | Type | Count | Share | Period |
|--------|------|-------|-------|--------|
| **Yad2** | Rental marketplace | ~909 | 45% | Q1 2026 |
| **Homeless TLV** | Facebook group (~150k members) | ~259 | 13% | Q1 2026 |
| **Facebook Marketplace** | Direct owner listings | ~198 | 10% | Q1 2026 |
| **Komo** | Agent & private aggregator | ~169 | 8% | Q1 2026 |
| **WinWin** | Property portal | ~123 | 6% | Q1 2026 |
| **OnMap** | Map-based search | ~97 | 5% | Q1 2026 |
| **Madlan** | Data-rich analytics (Yad2 sister) | ~91 | 5% | Q1 2026 |
| **Agora TLV** | Expat Facebook community | ~86 | 4% | Q1 2026 |
| **Private/verified** | Cross-verified from 2+ sources | ~68 | 3% | Q1 2026 |

Each listing includes: address (Hebrew), neighborhood, rooms, sqm, price (ILS), floor, days on market, condition, parking, elevator, balcony, A/C, mamad (safe room), pet-friendly, furniture level, building year, and verification status.

### Neighborhoods — 31 total

- **19 Tel Aviv neighborhoods**: Florentin, Old North, New North, Lev Hair (City Center), Neve Tzedek, Rothschild, Sarona, Kerem HaTeimanim, Montefiore, Noga, Bavli, Ramat Aviv, Tzahala, Hadar Yosef, Tel Baruch, Neve Sha'anan, Shapira, Kiryat Shalom, HaTikva, Yad Eliyahu, Nahalat Yitzhak, Jaffa, Ajami, Lev Yafo
- **12 surrounding cities**: Ramat Gan, Givatayim, Bat Yam, Holon, Herzliya, Bnei Brak, Petah Tikva + more

Per neighborhood: average rents (1-4br), price per sqm, coordinates, bounding box, livability scores, arnona, utilities, commute times, walkability, transit, safety, green space, nightlife, family-friendliness, moving cost estimates, and landlord vacancy costs.

### Government & Official Data

| Source | What | Period | How it's used |
|--------|------|--------|---------------|
| **CBS Rent Survey** | Average rents by room count, split by new/renewal/all tenants | Q4 2025 | Fallback scoring when comparables are scarce; closed market gap analysis |
| **nadlan.gov.il** | Property sale transactions (address, price, sqm, deal date) | Q3-Q4 2025 | Property value context, sale price per sqm by neighborhood |

### Derived & Computed Data

| Dataset | Source | Description |
|---------|--------|-------------|
| **Rent index trend** | Computed (CBS-based model) | 24-month time series (Mar 2024 - Feb 2026), 5.2% YoY growth, seasonal adjustments |
| **Seasonal demand** | Market observation | 12-month demand index — high (Jul-Sep), low (Nov-Feb), medium (rest) |
| **Closed market data** | CBS + community surveys | Asking vs. actual rent gap (3-6% by neighborhood), renewal discount (~5.5%), household estimates, renewal rates |
| **Quality scores** | Computed per listing | 0-100 weighted score: condition (25), elevator (15), parking (15), balcony (10), A/C (10), mamad (10), furniture (5), pets (5), building age (5) |
| **Negotiation tips** | Generated from scoring context | 3 actionable tips per rent check based on score, season, supply, trend, and comparable data |

### Data Pipeline

```
Real-world sources (Yad2, CBS, nadlan.gov.il, Facebook groups, ...)
  --> Backend scrapers (apps/api/api/scrapers/) — Playwright, httpx
  --> SQLite database (SQLModel ORM)
  --> Listing generation script (scripts/generate-listings.mjs)
  --> Static TypeScript literals (apps/web/lib/listings-data.ts, data.ts)
  --> Client-side scoring engine (apps/web/lib/scoring.ts)
  --> User results (verdict, comparables, tips, map)
```

The backend (`apps/api/`) has scraper infrastructure for Yad2 (Playwright-based), CBS (API client), and nadlan.gov.il (REST API). Currently uses seed data; the architecture supports live scraping via APScheduler.

### Scoring Engine

Three-tiered confidence model (all client-side in `lib/scoring.ts`):

| Tier | Comparables | Method | Data Source |
|------|------------|--------|-------------|
| **High** | 5+ | Percentile from comparable distribution | Listing data only |
| **Medium** | 3-4 | Blend of comps + neighborhood average | Listings + neighborhood stats |
| **Low** | 0-2 | Neighborhood average, then CBS fallback | Neighborhood averages / CBS survey |

## Key Design Decisions

**Israeli room count**: The living room (salon) counts as a room. "3 rooms" = 2 bedrooms + salon. The form explains this.

**Similarity matching**: Comparables ranked by room match (30%), sqm proximity (25%), quality (20%), floor (15%), freshness (10%).

**Closed market data**: The explore page shows what tenants actually pay vs. asking prices. Only ~15-20% of apartments are listed at any time — the other 80% are renewals paying 3-6% less.

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
| Data | 10 sources: Yad2, Homeless TLV, FB Marketplace, Komo, WinWin, OnMap, Madlan, Agora TLV, CBS, nadlan.gov.il |
| Backend | Python FastAPI, SQLModel, SQLite (data pipeline only) |
| Testing | Playwright E2E (74 tests), pytest |
| Hosting | GitHub Pages (static export), GitHub Actions CI/CD |

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
      lib/
        data.ts             # Neighborhoods, CBS stats, trends, seasonal, closed market, decision factors
        listings-data.ts    # 2,000 embedded listings from 9 sources
        scoring.ts          # Client-side rent scoring engine (3-tier confidence)
        types.ts            # TypeScript interfaces
        api.ts              # Data access layer (reads from embedded data)
        format.ts           # ILS currency formatting
      e2e/                  # Playwright tests (74 tests across 5 spec files)
    api/                    # FastAPI data pipeline
      api/
        scrapers/           # yad2.py, cbs.py, nadlan.py
        models/             # SQLModel: RentalListing, CBSRentStat, RentIndex, SaleTransaction, Neighborhood
        routers/            # neighborhoods, rent_check, stats
        services/           # rent_scorer, market_signals
  scripts/
    generate-listings.mjs   # Generates 2,000 listings with seeded PRNG
  .github/workflows/        # CI + deploy
```

## License

[MIT](LICENSE)

---

*dira = apartment in Hebrew*
