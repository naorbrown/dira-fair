# dira-fair 🏠

**Is your Tel Aviv rent fair?** Rental market intelligence that gives tenants the data they need to negotiate.

[![CI](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml/badge.svg)](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## The Problem

Israeli renters negotiate blind. Landlords know the market — tenants don't. There's no tool that answers a simple question: **given what similar apartments rent for in my neighborhood right now, am I overpaying?**

dira-fair fills that gap for Tel Aviv, starting with the most expensive rental market in Israel.

## What It Does

Enter your neighborhood, apartment size, and current rent. Get back:

- **Rent Score** — where your rent falls in the local distribution (below/at/above market)
- **Comparable listings** — similar apartments currently available (from Yad2)
- **Market signals** — trend direction, seasonal timing, days-on-market, supply levels
- **Negotiation tips** — data-driven advice specific to your situation

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  FastAPI Backend │
│  (Vercel)       │     │  (Fly.io)       │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │  Yad2    │ │ CBS API  │ │nadlan.gov│
              │ Scraper  │ │ (official│ │ .il      │
              │          │ │  stats)  │ │ (sales)  │
              └──────────┘ └──────────┘ └──────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) · Tailwind · shadcn/ui · Recharts · Leaflet |
| Backend | Python FastAPI · SQLModel · SQLite |
| Data | CBS REST API · nadlan.gov.il · Yad2 (Playwright scraper) |
| Infra | Vercel (frontend) · Fly.io (backend) · GitHub Actions (CI) |

## Data Sources

| Source | What | Granularity | Access |
|--------|------|-------------|--------|
| **Yad2** | Active rental listings | Street-level | Scraping |
| **CBS** | Official avg rents, CPI rent index | City + room count | Free API |
| **nadlan.gov.il** | Sale transactions | Address-level | Public data |
| **OpenStreetMap** | Neighborhood boundaries | Neighborhood | Overpass API |

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker (optional, for full-stack local dev)

### Quick Start

```bash
# Clone
git clone https://github.com/naorbrown/dira-fair.git
cd dira-fair

# Option 1: Docker (recommended)
docker compose up

# Option 2: Manual
# Backend
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn api.main:app --reload --port 8000

# Frontend
cd apps/web
npm install
npm run dev
```

Visit `http://localhost:3000`

### Seed the Database

```bash
cd apps/api
python -m api.scrapers.cbs      # Fetch CBS rent data
python -m api.scrapers.nadlan    # Fetch nadlan.gov.il transactions
python -m api.scrapers.yad2      # Scrape Yad2 listings (requires proxy config)
```

## Project Structure

```
dira-fair/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # FastAPI backend
│       ├── api/
│       │   ├── models/     # SQLModel data models
│       │   ├── routers/    # API endpoints
│       │   ├── scrapers/   # Data collection (CBS, nadlan, Yad2)
│       │   └── services/   # Business logic (scoring, signals)
│       └── data/           # Seed data & neighborhood definitions
├── .github/workflows/      # CI/CD
├── docker-compose.yml
└── CONTRIBUTING.md
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## Roadmap

- [x] Project setup & architecture
- [ ] Data pipeline (CBS + nadlan + Yad2)
- [ ] Rent score algorithm
- [ ] Neighborhood map (Leaflet choropleth)
- [ ] Landing page + rent checker
- [ ] Dashboard with trends
- [ ] Deploy to Vercel + Fly.io
- [ ] Hebrew language support
- [ ] User-contributed rent data
- [ ] Expand beyond Tel Aviv

## License

[MIT](LICENSE)

---

*dira (דירה) = apartment in Hebrew*
