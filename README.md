# dira-fair 🏠

**Is your Tel Aviv rent fair?** Rental market intelligence that gives tenants the data they need to negotiate.

**[Live Site →](https://naorbrown.github.io/dira-fair/)**

[![CI](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml/badge.svg)](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml)
[![Deploy](https://github.com/naorbrown/dira-fair/actions/workflows/deploy.yml/badge.svg)](https://github.com/naorbrown/dira-fair/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## The Problem

Israeli renters negotiate blind. Landlords know the market — tenants don't. There's no tool that answers a simple question: **given what similar apartments rent for in my neighborhood right now, am I overpaying?**

dira-fair fills that gap for Tel Aviv, starting with the most expensive rental market in Israel.

## What It Does

Enter your neighborhood, apartment size, and current rent. Get back:

- **Rent Score** — where your rent falls in the local distribution (below/at/above market)
- **Comparable listings** — similar apartments currently available (sourced from Yad2)
- **Market signals** — trend direction, seasonal timing, days-on-market, supply levels
- **Negotiation tips** — data-driven advice specific to your situation

## Architecture

The live site is a **fully static Next.js app** deployed to GitHub Pages — no backend required at runtime. All scoring logic runs client-side against embedded market data.

```
┌──────────────────────────────────┐
│     Next.js Static Site          │
│     (GitHub Pages)               │
│                                  │
│  ┌────────────┐ ┌─────────────┐ │
│  │ lib/data.ts│ │lib/scoring  │ │
│  │ (embedded  │ │.ts (client- │ │
│  │  market    │ │ side rent   │ │
│  │  data)     │ │ scorer)     │ │
│  └────────────┘ └─────────────┘ │
└──────────────────────────────────┘

Data sourced from:
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  Yad2    │ │ CBS API  │ │nadlan.gov│
  │ listings │ │ (official│ │ .il      │
  │          │ │  stats)  │ │ (sales)  │
  └──────────┘ └──────────┘ └──────────┘
```

A **FastAPI backend** exists in `apps/api/` for data collection (scraping Yad2, fetching CBS/nadlan data) and can serve as a full API for future dynamic features.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) · Tailwind CSS · Recharts |
| Scoring | Client-side TypeScript (percentile-based against Yad2 comps, CBS fallback) |
| Data | CBS rent survey · nadlan.gov.il sale transactions · Yad2 rental listings |
| Backend (data pipeline) | Python FastAPI · SQLModel · SQLite |
| Testing | Playwright (e2e) · pytest (backend) |
| Hosting | GitHub Pages (static export) · GitHub Actions (CI/CD) |

## Data Sources

| Source | What | Granularity | Access |
|--------|------|-------------|--------|
| **Yad2** | Active rental listings (35 listings across 19 neighborhoods) | Street-level | Scraping (Playwright) |
| **CBS** | Official avg rents by room count, new vs renewal tenant delta | City + room count | Free REST API |
| **nadlan.gov.il** | Sale transactions (price/sqm, deal dates) | Address-level | Public data |
| **Curated benchmarks** | Rent ranges by neighborhood, researched from market reports | Neighborhood | Static JSON |

### Current Coverage

- **19 Tel Aviv neighborhoods** — from HaTikva (2br ~4,200) to Neve Tzedek/Sarona (2br ~11,000)
- **35 active rental listings** with realistic 2026 prices
- **CBS Q3 2025 stats** — 2br new tenant avg 7,200, renewal 6,800
- **24-month rent index** trend data (5.5% annual growth)

## Getting Started

### View the Live Site

Visit **[naorbrown.github.io/dira-fair](https://naorbrown.github.io/dira-fair/)** — no setup needed.

### Local Development

```bash
# Clone
git clone https://github.com/naorbrown/dira-fair.git
cd dira-fair

# Frontend (static site)
cd apps/web
npm install
npm run dev         # Dev server at http://localhost:3000

# Backend (data pipeline — optional)
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn api.main:app --reload --port 8000

# Seed the database with market data
python -m api.seed
```

### Run Tests

```bash
# E2E tests (frontend)
cd apps/web
npm run build
npx playwright install --with-deps
npx playwright test

# Backend tests
cd apps/api
pytest -v
```

## Project Structure

```
dira-fair/
├── apps/
│   ├── web/                    # Next.js static frontend
│   │   ├── app/                # Pages (landing, check, dashboard, neighborhood)
│   │   ├── components/         # UI components (form, score card, charts)
│   │   ├── lib/
│   │   │   ├── data.ts         # Embedded market data (neighborhoods, listings, CBS)
│   │   │   ├── scoring.ts      # Client-side rent scoring engine
│   │   │   └── api.ts          # Data access layer
│   │   └── e2e/                # Playwright e2e tests (14 tests)
│   └── api/                    # FastAPI data pipeline
│       ├── api/
│       │   ├── models/         # SQLModel data models
│       │   ├── routers/        # API endpoints
│       │   ├── scrapers/       # Data collection (CBS, nadlan, Yad2)
│       │   └── services/       # Business logic (scoring, signals)
│       └── data/               # Seed data & neighborhood definitions
├── .github/workflows/
│   ├── ci.yml                  # Lint + test on PR
│   └── deploy.yml              # Deploy to GitHub Pages on merge
├── docker-compose.yml
└── CONTRIBUTING.md
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## Roadmap

### Done

- [x] Project setup & architecture
- [x] Data pipeline (CBS + nadlan + Yad2 scrapers)
- [x] Rent score algorithm (percentile-based with market signals)
- [x] Landing page with rent checker form
- [x] "Check Your Rent" results page with score, signals, and tips
- [x] Dashboard with neighborhood table, trend chart, and seasonal indicator
- [x] Neighborhood detail pages (19 neighborhoods)
- [x] Static site deployment to GitHub Pages
- [x] Real 2026 market data (researched from current sources)
- [x] E2E test suite (14 Playwright tests)
- [x] CI/CD (GitHub Actions: lint, test, build, deploy)

### Next

- [ ] Neighborhood map (Leaflet choropleth with GeoJSON boundaries)
- [ ] Hebrew language support (RTL layout)
- [ ] User-contributed rent data (anonymous submissions)
- [ ] Automated data refresh (scheduled Yad2/CBS scraping)
- [ ] Expand beyond Tel Aviv (Haifa, Jerusalem, Be'er Sheva)

## License

[MIT](LICENSE)

---

*dira (דירה) = apartment in Hebrew*
