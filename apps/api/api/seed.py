"""Seed the database with neighborhood data and initial scrapes.

Usage:
    cd apps/api
    python -m api.seed
"""

import json
from pathlib import Path

from sqlmodel import Session

from api.database import create_db_and_tables, engine
from api.models import Neighborhood
from api.scrapers.cbs import CBSScraper
from api.scrapers.nadlan import NadlanScraper
from api.scrapers.yad2 import Yad2Scraper

DATA_DIR = Path(__file__).parent.parent / "data"


def seed_neighborhoods(session: Session) -> int:
    data = json.loads((DATA_DIR / "neighborhoods.json").read_text())
    count = 0
    for item in data:
        neighborhood = Neighborhood(**item)
        session.merge(neighborhood)
        count += 1
    session.commit()
    return count


def main():
    create_db_and_tables()

    with Session(engine) as session:
        n = seed_neighborhoods(session)
        print(f"Seeded {n} neighborhoods")

        cbs = CBSScraper()
        n1 = cbs.fetch_rent_survey(session)
        n2 = cbs.fetch_rent_index(session)
        print(f"CBS: {n1} rent stats, {n2} index entries")

        nadlan = NadlanScraper()
        n3 = nadlan.fetch_transactions(session)
        print(f"Nadlan: {n3} transactions")

        yad2 = Yad2Scraper()
        n4 = yad2.scrape_listings(session)
        print(f"Yad2: {n4} listings")

    print("Done! Database seeded successfully.")


if __name__ == "__main__":
    main()
