"""nadlan.gov.il fetcher for sale transaction data.

Fetches real estate sale transactions from the Israeli government's
public property transaction database.

Usage:
    python -m api.scrapers.nadlan
"""

from datetime import date, datetime

import httpx
from sqlmodel import Session

from api.database import create_db_and_tables, engine
from api.models import SaleTransaction
from api.scrapers.base import log_scrape

# Neighborhood mapping: street keywords -> neighborhood IDs
# This is a simplified version; production would use geocoding
STREET_TO_NEIGHBORHOOD = {
    "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df": "florentin",
    "\u05d0\u05dc\u05e0\u05d1\u05d9": "florentin",
    "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3": "old-north",
    "\u05d1\u05df \u05d9\u05d4\u05d5\u05d3\u05d4": "old-north",
    "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3": "lev-hair",
    "\u05d4\u05e8\u05e6\u05dc": "lev-hair",
    "\u05e9\u05d9\u05e0\u05e7\u05d9\u05df": "lev-hair",
    "\u05e0\u05d7\u05dc\u05ea \u05d1\u05e0\u05d9\u05de\u05d9\u05df": "neve-tzedek",
    "\u05e9\u05d1\u05d6\u05d9": "neve-tzedek",
    "\u05d0\u05d1\u05df \u05d2\u05d1\u05d9\u05e8\u05d5\u05dc": "old-north",
    "\u05d0\u05e8\u05dc\u05d5\u05d6\u05d5\u05e8\u05d5\u05d1": "old-north",
    "\u05e0\u05d5\u05e8\u05d3\u05d0\u05d5": "old-north",
    "\u05d1\u05d5\u05d2\u05e8\u05e9\u05d5\u05d1": "lev-hair",
    "\u05d9\u05e4\u05d5": "jaffa",
    "\u05e2\u05d2'\u05de\u05d9": "ajami",
    "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1": "ramat-aviv",
    "\u05d1\u05d1\u05dc\u05d9": "bavli",
    "\u05e6\u05d4\u05dc\u05d4": "tzahala",
}


class NadlanScraper:
    def __init__(self):
        self.client = httpx.Client(
            headers={"User-Agent": "dira-fair/0.1 (rental market research)"},
            timeout=30.0,
        )

    def _guess_neighborhood(self, address: str) -> str | None:
        for keyword, hood_id in STREET_TO_NEIGHBORHOOD.items():
            if keyword in address:
                return hood_id
        return None

    def fetch_transactions(
        self, session: Session, city: str = "\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1-\u05d9\u05e4\u05d5"
    ) -> int:
        """Fetch recent sale transactions for a city.

        In production, this calls the nadlan.gov.il API. For MVP, we seed
        with representative data to demonstrate the app.
        """
        # Placeholder seed data — representative TLV transactions
        sample_transactions = [
            {"address": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 42", "rooms": 2, "sqm": 50, "floor": 3, "price": 2200000, "date": "2025-10-15"},
            {"address": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 18", "rooms": 3, "sqm": 75, "floor": 2, "price": 3500000, "date": "2025-09-20"},
            {"address": "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 210", "rooms": 3, "sqm": 80, "floor": 4, "price": 4200000, "date": "2025-11-01"},
            {"address": "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 88", "rooms": 2.5, "sqm": 65, "floor": 5, "price": 3100000, "date": "2025-10-05"},
            {"address": "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3 50", "rooms": 3, "sqm": 85, "floor": 3, "price": 5500000, "date": "2025-08-12"},
            {"address": "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3 22", "rooms": 4, "sqm": 110, "floor": 2, "price": 7800000, "date": "2025-09-30"},
            {"address": "\u05e9\u05d1\u05d6\u05d9 15", "rooms": 2, "sqm": 55, "floor": 1, "price": 3200000, "date": "2025-10-22"},
            {"address": "\u05d0\u05d1\u05df \u05d2\u05d1\u05d9\u05e8\u05d5\u05dc 150", "rooms": 3, "sqm": 78, "floor": 6, "price": 4100000, "date": "2025-11-10"},
            {"address": "\u05d1\u05df \u05d9\u05d4\u05d5\u05d3\u05d4 90", "rooms": 2, "sqm": 52, "floor": 4, "price": 2800000, "date": "2025-09-15"},
            {"address": "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1 \u05d2 30", "rooms": 4, "sqm": 100, "floor": 8, "price": 4500000, "date": "2025-10-01"},
            {"address": "\u05d1\u05d1\u05dc\u05d9 12", "rooms": 3.5, "sqm": 90, "floor": 5, "price": 4800000, "date": "2025-08-25"},
            {"address": "\u05d9\u05e4\u05d5 60", "rooms": 2, "sqm": 48, "floor": 2, "price": 1800000, "date": "2025-11-05"},
        ]

        count = 0
        for i, tx in enumerate(sample_transactions):
            deal_date = date.fromisoformat(tx["date"])
            price_per_sqm = tx["price"] // tx["sqm"]
            neighborhood_id = self._guess_neighborhood(tx["address"])

            transaction = SaleTransaction(
                id=f"nadlan-seed-{i}",
                address=tx["address"],
                neighborhood_id=neighborhood_id,
                rooms=tx["rooms"],
                sqm=tx["sqm"],
                floor=tx["floor"],
                price=tx["price"],
                price_per_sqm=price_per_sqm,
                deal_date=deal_date,
                fetched_at=datetime.utcnow(),
            )
            session.merge(transaction)
            count += 1

        session.commit()
        log_scrape("nadlan", count)
        return count


if __name__ == "__main__":
    create_db_and_tables()
    scraper = NadlanScraper()
    with Session(engine) as session:
        n = scraper.fetch_transactions(session)
        print(f"nadlan: {n} transactions")
