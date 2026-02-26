# dira-fair

**Is your Tel Aviv rent fair?** Rental market intelligence that gives tenants the data they need to negotiate.

**[Live Site](https://naorbrown.github.io/dira-fair/)**

[![CI](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml/badge.svg)](https://github.com/naorbrown/dira-fair/actions/workflows/ci.yml)
[![Deploy](https://github.com/naorbrown/dira-fair/actions/workflows/deploy.yml/badge.svg)](https://github.com/naorbrown/dira-fair/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## The Problem

Israeli renters negotiate blind. Landlords know the market -- tenants don't. There's no tool that answers a simple question: **given what similar apartments rent for in my neighborhood right now, am I overpaying?**

dira-fair fills that gap for Tel Aviv, starting with the most expensive rental market in Israel.

## What It Does

Enter your neighborhood, apartment size (Israeli room count), and current rent. Get back:

- **Rent Score** -- where your rent falls in the local distribution (below/at/above market)
- **Comparable listings** -- similar apartments with direct Yad2 links, quality scores, and feature comparison
- **Quality-weighted matching** -- comparables ranked by similarity (rooms, sqm, floor, amenities)
- **Market signals** -- trend direction, seasonal timing, days-on-market, supply levels
- **Negotiation tips** -- data-driven advice specific to your situation
- **Success stories** -- real strategies that worked for other tenants
- **Alternative neighborhoods** -- cheaper areas with links to active listings
- **Source links** -- every data point links back to Yad2, CBS, or nadlan.gov.il

## Key Features

### Google-Like Simplicity
The homepage is as simple as a search engine: enter neighborhood, rooms, sqm, and rent. One click gives you everything.

### Israeli Room Count
Rooms follow the Israeli convention: the living room (salon) counts as a room. A "3-room" apartment = 2 bedrooms + salon. The form explains this clearly.

### Quality-Weighted Comparisons
Each listing has a quality score (0-100) based on weighted amenities:
- **Condition** (25 pts): new, renovated, good, fair, needs work
- **Elevator** (15 pts): critical for upper floors
- **Parking** (15 pts): hard to find in Tel Aviv
- **Balcony** (10 pts), **A/C** (10 pts), **Mamad/safe room** (10 pts)
- **Furniture** (5 pts), **Pet-friendly** (5 pts), **Building age** (5 pts)

### Similarity Scoring
Comparable apartments are ranked by how similar they are to yours:
- Room count match (30 pts)
- Sqm proximity (25 pts)
- Quality score match (20 pts)
- Floor range (15 pts)
- Listing freshness (10 pts)

### Actionable Insights
- Negotiation strategies backed by market data
- Success stories from tenants who lowered their rent
- Links to cheaper alternatives in nearby neighborhoods
- Tenant rights resources (Kol Zchut)

### Real Links Throughout
Every listing links to its Yad2 page. Every neighborhood links to its Yad2 search. Data sources (CBS, nadlan.gov.il) are linked with attribution.

## Architecture

The live site is a **fully static Next.js app** deployed to GitHub Pages -- no backend required at runtime. All scoring logic runs client-side against embedded market data.

```
User input (neighborhood, rooms, sqm, rent)
  |
  v
lib/scoring.ts (client-side)
  |-- scoreRent() -> percentile, confidence, distribution
  |-- getSignals() -> trend, season, supply, days-on-market
  |-- generateTips() -> actionable negotiation advice
  |-- computeSimilarity() -> quality-weighted comparable ranking
  |
  v
Results page with:
  - Verdict (overpaying/fair/saving)
  - Score card with percentile bar
  - Map + comparable listings (with Yad2 links)
  - Quality badges (parking, elevator, A/C, mamad, etc.)
  - Price distribution box plot
  - Negotiation tips
  - Success stories
  - Alternative neighborhoods
```

A **FastAPI backend** exists in `apps/api/` for data collection (scraping Yad2, fetching CBS/nadlan data) and can serve as a full API for future dynamic features.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts, Leaflet |
| Scoring | Client-side TypeScript (quality-weighted percentile scoring) |
| Data | CBS rent survey, nadlan.gov.il transactions, Yad2 rental listings |
| Backend (data pipeline) | Python FastAPI, SQLModel, SQLite |
| Testing | Playwright (E2E), pytest (backend) |
| Hosting | GitHub Pages (static export), GitHub Actions (CI/CD) |

## Data Sources

| Source | What | Access | Link |
|--------|------|--------|------|
| **Yad2** | 129 active rental listings across 19 neighborhoods | Scraping | [yad2.co.il](https://www.yad2.co.il/realestate/rent?city=5000) |
| **CBS** | Official avg rents by room count, new vs renewal tenant delta | Free API | [cbs.gov.il](https://www.cbs.gov.il/en/subjects/Pages/Rent.aspx) |
| **nadlan.gov.il** | Sale transactions (price/sqm, deal dates) | Public | [nadlan.gov.il](https://www.nadlan.gov.il/) |

### Current Coverage

- **19 Tel Aviv neighborhoods** -- from HaTikva (~4,200/mo) to Neve Tzedek/Sarona (~11,500/mo)
- **129 active rental listings** with quality scores, amenity data, and Yad2 links
- **9 quality fields per listing** (condition, parking, elevator, balcony, A/C, mamad, pet-friendly, furniture, building year)
- **CBS Q4 2025 stats** -- rent by room count, new vs renewal tenants
- **24-month rent index** trend data
- **4 negotiation success stories**

## Getting Started

### View the Live Site

Visit **[naorbrown.github.io/dira-fair](https://naorbrown.github.io/dira-fair/)** -- no setup needed.

### Local Development

```bash
# Clone
git clone https://github.com/naorbrown/dira-fair.git
cd dira-fair

# Frontend (static site)
cd apps/web
npm install
npm run dev         # Dev server at http://localhost:3000

# Backend (data pipeline -- optional)
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
│   │   ├── components/         # UI components (form, score card, charts, map)
│   │   ├── lib/
│   │   │   ├── data.ts         # Embedded market data + quality scoring + Yad2 URLs
│   │   │   ├── scoring.ts      # Client-side rent scoring engine
│   │   │   ├── types.ts        # TypeScript interfaces (with quality fields)
│   │   │   ├── api.ts          # Data access layer
│   │   │   └── format.ts       # Currency & number formatting
│   │   └── e2e/                # Playwright e2e tests
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

## Quality Fields

Each listing includes these quality attributes for fair comparison:

| Field | Type | Weight | Description |
|-------|------|--------|-------------|
| `condition` | new/renovated/good/fair/needs_work | 25 | Physical condition of apartment |
| `has_elevator` | boolean | 15 | Building has elevator |
| `has_parking` | boolean | 15 | Parking spot included |
| `has_balcony` | boolean | 10 | Has balcony/mirpeset |
| `has_ac` | boolean | 10 | Air conditioning installed |
| `has_mamad` | boolean | 10 | Safe room (important in Israel) |
| `furniture` | full/partial/none | 5 | Furnishing level |
| `is_pet_friendly` | boolean | 5 | Allows pets |
| `building_year` | number | 5 | Year building was constructed |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## Roadmap

### Done

- [x] Project setup & architecture
- [x] Data pipeline (CBS + nadlan + Yad2 scrapers)
- [x] Rent score algorithm (percentile-based with market signals)
- [x] Landing page with Google-like simplicity
- [x] Israeli room count convention with clear explanations
- [x] Quality-weighted comparable matching (9 amenity fields)
- [x] Direct Yad2 links on all listings and neighborhoods
- [x] Negotiation success stories and strategies
- [x] Alternative neighborhood suggestions for overpaying tenants
- [x] Data source attribution with links (Yad2, CBS, nadlan.gov.il)
- [x] Tenant rights resources (Kol Zchut links)
- [x] Dashboard with neighborhood table, trend chart, seasonal indicator
- [x] Neighborhood detail pages with quality badges
- [x] Static site deployment to GitHub Pages
- [x] 129 listings with quality scores across 19 neighborhoods
- [x] E2E test suite (Playwright)
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

*dira = apartment in Hebrew*
