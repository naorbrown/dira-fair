# dira-fair

Rental market intelligence app for Tel Aviv tenants.

## Architecture

- **Frontend**: Next.js 14 (App Router) in `apps/web/` — Tailwind + shadcn/ui + Recharts + Leaflet
- **Backend**: Python FastAPI in `apps/api/` — SQLModel + SQLite
- **Data sources**: Yad2 (scraping), CBS API (official stats), nadlan.gov.il (sales)

## Commands

### Backend (apps/api/)
```bash
pip install -e ".[dev]"          # Install with dev deps
uvicorn api.main:app --reload    # Dev server on :8000
pytest                           # Run tests
ruff check . && ruff format .    # Lint + format
```

### Frontend (apps/web/)
```bash
npm install          # Install deps
npm run dev          # Dev server on :3000
npm run lint         # ESLint
npm run build        # Production build
```

### Full stack
```bash
docker compose up    # Both services with hot reload
```

## Key Conventions

- Python models use SQLModel (combines SQLAlchemy + Pydantic)
- API routes go in `apps/api/api/routers/`
- Scrapers go in `apps/api/api/scrapers/` — each source is its own module
- Business logic (scoring, signals) goes in `apps/api/api/services/`
- Frontend components use shadcn/ui conventions — components in `apps/web/components/`
- All monetary values are in ILS (₪), stored as integers (no floats for money)
- Neighborhood IDs are slugs: "florentin", "old-north", "neve-tzedek"
- English-first UI, Hebrew support planned for Phase 2

## Data Flow

User input → `/api/check` → queries RentalListing (Yad2) + CBSRentStat + SaleTransaction → rent_scorer.py computes percentile + signals → returns score + tips

## Testing

- Backend: pytest + httpx for API tests
- Frontend: vitest + React Testing Library
- Always test scoring logic with known inputs → expected outputs
