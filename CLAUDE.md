# DiraFair

Rental market intelligence app for Tel Aviv tenants.

## Architecture

- **Frontend**: Next.js 14 (App Router) in `apps/web/` -- Tailwind, Recharts, Leaflet maps
- **Backend**: Python FastAPI in `apps/api/` -- SQLModel + SQLite (data pipeline only)
- **Static export**: `output: "export"` with `basePath: "/dira-fair"` and `trailingSlash: true`
- **Hosting**: GitHub Pages -- no runtime backend, all scoring is client-side

## Pages

- `/` -- Landing page with address autocomplete + manual neighborhood select
- `/check` -- Rent check results (verdict, score card, map, comparables, tips)
- `/explore` -- Browse 2,000+ listings with Leaflet map, filters, market data, decision factors
- `/dashboard` -- Market stats (neighborhood table, trend chart, seasonal indicator)
- `/neighborhood/[slug]` -- 31 neighborhood detail pages

## Data

- `lib/data.ts` -- Neighborhood definitions, helper functions, CBS/closed market data
- `lib/listings-data.ts` -- 2,000+ embedded listings across 19 neighborhoods from 9 sources
- `lib/scoring.ts` -- Client-side rent scoring engine
- `lib/types.ts` -- TypeScript interfaces
- `lib/api.ts` -- Data access layer (fetches from embedded data, not network)
- `lib/format.ts` -- Currency/number formatting (ILS)

## Commands

### Frontend (apps/web/)
```bash
npm install          # Install deps
npm run dev          # Dev server on :3000
npm run lint         # ESLint
npm run build        # Production build (static export)
npx playwright test  # 74 e2e tests
```

### Backend (apps/api/)
```bash
pip install -e ".[dev]"
uvicorn api.main:app --reload
pytest
ruff check . && ruff format .
```

## Key Conventions

- All monetary values in ILS, stored as integers
- Neighborhood IDs are slugs: "florentin", "old-north", "neve-tzedek"
- Israeli room count: living room (salon) counts as a room
- Quality score 0-100 based on weighted amenities
- Similarity scoring for comparable matching
- All URLs use trailing slashes (Next.js trailingSlash config)
- English-first UI
- Python models use SQLModel
- API routes in `apps/api/api/routers/`, scrapers in `apps/api/api/scrapers/`

## Testing

- **74 Playwright e2e tests** across 5 spec files:
  - `links.spec.ts` -- Comprehensive link verification (all pages, all 31 neighborhoods)
  - `landing.spec.ts` -- Landing page form, fields, room definitions
  - `rent-check.spec.ts` -- Full rent check flow, above/below/at market
  - `dashboard.spec.ts` -- Table, chart, seasonal indicator
  - `neighborhood.spec.ts` -- Detail pages, Yad2 links, quality badges
- Backend: pytest + httpx

## Data Flow

User input --> `lib/scoring.ts` (client-side) --> scoreRent() computes percentile + signals --> returns score + tips + comparables
