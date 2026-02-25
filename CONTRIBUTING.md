# Contributing to dira-fair

Thanks for your interest in contributing! This project aims to give Tel Aviv renters better market data for negotiating their rent.

## Development Setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose (optional but recommended)

### Local Development

#### With Docker (recommended)

```bash
git clone https://github.com/naorbrown/dira-fair.git
cd dira-fair
docker compose up
```

This starts both the API (port 8000) and frontend (port 3000) with hot reload.

#### Without Docker

**Backend:**
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn api.main:app --reload --port 8000
```

**Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

### Running Tests

```bash
# Backend
cd apps/api
pytest

# Frontend
cd apps/web
npm test
```

### Linting

```bash
# Backend
cd apps/api
ruff check .
ruff format .

# Frontend
cd apps/web
npm run lint
```

## Branching Strategy

- `main` — production, always deployable
- Feature branches: `feat/description`
- Bug fixes: `fix/description`
- Data work: `data/description`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, atomic commits
3. Ensure all tests pass and linting is clean
4. Open a PR with a clear description of what and why
5. Request review

## Areas Where Help Is Needed

- **Neighborhood data** — curating rent benchmarks for Tel Aviv neighborhoods
- **Hebrew translations** — UI strings for Hebrew language support
- **Data analysis** — improving the rent scoring algorithm
- **Frontend** — UI/UX improvements, mobile responsiveness
- **Documentation** — improving guides and API docs

## Code Style

- **Python**: Follow PEP 8. We use `ruff` for linting and formatting.
- **TypeScript**: Follow the existing ESLint configuration.
- **Commits**: Use conventional commit messages (`feat:`, `fix:`, `docs:`, etc.)

## Questions?

Open an issue or start a discussion. We're happy to help you get started.
