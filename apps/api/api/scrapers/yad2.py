"""Yad2 rental listing scraper.

Scrapes active rental listings from Yad2 for Tel Aviv.
Uses Playwright for headless browser automation.

Usage:
    python -m api.scrapers.yad2
"""

import json
import logging
from datetime import datetime

from sqlmodel import Session, select

from api.database import create_db_and_tables, engine
from api.models import RentalListing
from api.scrapers.base import log_scrape

logger = logging.getLogger("dira-fair.scrapers.yad2")

# Yad2 area codes for Tel Aviv neighborhoods
YAD2_TLV_AREA = "2"  # Tel Aviv district
YAD2_TLV_CITY = "5000"  # Tel Aviv-Yafo city code

# Mapping of Yad2 neighborhood names to our neighborhood IDs
YAD2_NEIGHBORHOOD_MAP = {
    "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df": "florentin",
    "\u05dc\u05d1 \u05d4\u05e2\u05d9\u05e8": "lev-hair",
    "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df": "old-north",
    "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d7\u05d3\u05e9": "new-north",
    "\u05e0\u05d5\u05d5\u05d4 \u05e6\u05d3\u05e7": "neve-tzedek",
    "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd": "kerem-hateimanim",
    "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3": "lev-hair",
    "\u05e0\u05d7\u05dc\u05ea \u05d1\u05e0\u05d9\u05de\u05d9\u05df": "neve-tzedek",
    "\u05d9\u05e4\u05d5": "jaffa",
    "\u05e2\u05d2'\u05de\u05d9": "ajami",
    "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1": "ramat-aviv",
    "\u05d1\u05d1\u05dc\u05d9": "bavli",
    "\u05e6\u05d4\u05dc\u05d4": "tzahala",
    "\u05e0\u05d5\u05d5\u05d4 \u05e9\u05d0\u05e0\u05df": "neve-shaanan",
    "\u05e9\u05e4\u05d9\u05e8\u05d0": "shapira",
    "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9": "montefiore",
    "\u05e9\u05e8\u05d5\u05e0\u05d4": "sarona",
    "\u05d9\u05d3 \u05d0\u05dc\u05d9\u05d4\u05d5": "yad-eliyahu",
    "\u05e0\u05d7\u05dc\u05ea \u05d9\u05e6\u05d7\u05e7": "nahalat-yitzhak",
    "\u05e7\u05e8\u05d9\u05ea \u05e9\u05dc\u05d5\u05dd": "kiryat-shalom",
    "\u05d4\u05ea\u05e7\u05d5\u05d5\u05d4": "hatikva",
}


class Yad2Scraper:
    """Scrapes rental listings from Yad2.

    In production, this uses Playwright to render the Yad2 SPA and extract
    listing data. For the MVP seed, we provide representative data.
    """

    def _guess_neighborhood(self, address: str, area_name: str | None) -> str | None:
        if area_name:
            for yad2_name, hood_id in YAD2_NEIGHBORHOOD_MAP.items():
                if yad2_name in area_name:
                    return hood_id
        for yad2_name, hood_id in YAD2_NEIGHBORHOOD_MAP.items():
            if yad2_name in (address or ""):
                return hood_id
        return None

    def scrape_listings(self, session: Session) -> int:
        """Scrape Tel Aviv rental listings from Yad2.

        Production implementation would use Playwright. For MVP, we seed
        with representative listing data to demonstrate the scoring engine.
        """
        seed_listings = [
            # Florentin (5 listings)
            {"id": "yad2-001", "address": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 32", "area": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df", "rooms": 2, "sqm": 50, "floor": 3, "price": 6400, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-002", "address": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 55", "area": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df", "rooms": 2, "sqm": 48, "floor": 2, "price": 6200, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-003", "address": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 10", "area": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df", "rooms": 3, "sqm": 70, "floor": 4, "price": 8800, "features": {"mamad": True, "elevator": True, "parking": False}},
            {"id": "yad2-004", "address": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 28", "area": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df", "rooms": 2.5, "sqm": 55, "floor": 1, "price": 7200, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-022", "address": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 40", "area": "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df", "rooms": 1, "sqm": 35, "floor": 5, "price": 5300, "features": {"mamad": False, "elevator": False, "parking": False}},
            # Old North (6 listings)
            {"id": "yad2-005", "address": "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 180", "area": "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df", "rooms": 3, "sqm": 75, "floor": 5, "price": 12200, "features": {"mamad": True, "elevator": True, "parking": True}},
            {"id": "yad2-006", "address": "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 220", "area": "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df", "rooms": 2, "sqm": 55, "floor": 3, "price": 9200, "features": {"mamad": False, "elevator": True, "parking": False}},
            {"id": "yad2-007", "address": "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 150", "area": "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df", "rooms": 3.5, "sqm": 85, "floor": 4, "price": 13500, "features": {"mamad": True, "elevator": True, "parking": True}},
            {"id": "yad2-008", "address": "\u05d0\u05d1\u05df \u05d2\u05d1\u05d9\u05e8\u05d5\u05dc 100", "area": "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df", "rooms": 2.5, "sqm": 60, "floor": 6, "price": 10200, "features": {"mamad": True, "elevator": True, "parking": False}},
            {"id": "yad2-023", "address": "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 100", "area": "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df", "rooms": 2, "sqm": 52, "floor": 2, "price": 9600, "features": {"mamad": False, "elevator": True, "parking": False}},
            {"id": "yad2-024", "address": "\u05d0\u05d1\u05df \u05d2\u05d1\u05d9\u05e8\u05d5\u05dc 200", "area": "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df", "rooms": 3, "sqm": 72, "floor": 3, "price": 11800, "features": {"mamad": True, "elevator": True, "parking": False}},
            # City Center (3 listings)
            {"id": "yad2-009", "address": "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3 35", "area": "\u05dc\u05d1 \u05d4\u05e2\u05d9\u05e8", "rooms": 2, "sqm": 55, "floor": 3, "price": 8800, "features": {"mamad": False, "elevator": True, "parking": False}},
            {"id": "yad2-010", "address": "\u05e9\u05d9\u05e0\u05e7\u05d9\u05df 20", "area": "\u05dc\u05d1 \u05d4\u05e2\u05d9\u05e8", "rooms": 2, "sqm": 50, "floor": 2, "price": 8200, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-011", "address": "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3 70", "area": "\u05dc\u05d1 \u05d4\u05e2\u05d9\u05e8", "rooms": 3, "sqm": 80, "floor": 4, "price": 12500, "features": {"mamad": True, "elevator": True, "parking": True}},
            # Neve Tzedek (4 listings)
            {"id": "yad2-012", "address": "\u05e9\u05d1\u05d6\u05d9 8", "area": "\u05e0\u05d5\u05d5\u05d4 \u05e6\u05d3\u05e7", "rooms": 2, "sqm": 52, "floor": 1, "price": 10800, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-013", "address": "\u05e9\u05d1\u05d6\u05d9 25", "area": "\u05e0\u05d5\u05d5\u05d4 \u05e6\u05d3\u05e7", "rooms": 3, "sqm": 78, "floor": 2, "price": 15200, "features": {"mamad": True, "elevator": False, "parking": False}},
            {"id": "yad2-026", "address": "\u05e0\u05d7\u05dc\u05ea \u05d1\u05e0\u05d9\u05de\u05d9\u05df 12", "area": "\u05e0\u05d5\u05d5\u05d4 \u05e6\u05d3\u05e7", "rooms": 2, "sqm": 48, "floor": 2, "price": 10500, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-027", "address": "\u05e9\u05d1\u05d6\u05d9 42", "area": "\u05e0\u05d5\u05d5\u05d4 \u05e6\u05d3\u05e7", "rooms": 4, "sqm": 110, "floor": 3, "price": 20500, "features": {"mamad": True, "elevator": True, "parking": True}},
            # Jaffa (2 listings)
            {"id": "yad2-014", "address": "\u05d9\u05e4\u05d5 120", "area": "\u05d9\u05e4\u05d5", "rooms": 2, "sqm": 45, "floor": 2, "price": 5600, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-015", "address": "\u05d9\u05e4\u05d5 80", "area": "\u05d9\u05e4\u05d5", "rooms": 3, "sqm": 65, "floor": 3, "price": 7800, "features": {"mamad": False, "elevator": False, "parking": False}},
            # Ramat Aviv (2 listings)
            {"id": "yad2-016", "address": "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1 15", "area": "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1", "rooms": 3, "sqm": 80, "floor": 7, "price": 10800, "features": {"mamad": True, "elevator": True, "parking": True}},
            {"id": "yad2-017", "address": "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1 40", "area": "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1", "rooms": 4, "sqm": 100, "floor": 10, "price": 13500, "features": {"mamad": True, "elevator": True, "parking": True}},
            # Bavli (2 listings)
            {"id": "yad2-018", "address": "\u05d1\u05d1\u05dc\u05d9 8", "area": "\u05d1\u05d1\u05dc\u05d9", "rooms": 3, "sqm": 85, "floor": 4, "price": 11200, "features": {"mamad": True, "elevator": True, "parking": True}},
            {"id": "yad2-019", "address": "\u05d1\u05d1\u05dc\u05d9 22", "area": "\u05d1\u05d1\u05dc\u05d9", "rooms": 4, "sqm": 105, "floor": 6, "price": 14500, "features": {"mamad": True, "elevator": True, "parking": True}},
            # Neve Sha'anan (1 listing)
            {"id": "yad2-020", "address": "\u05e0\u05d5\u05d5\u05d4 \u05e9\u05d0\u05e0\u05df 5", "area": "\u05e0\u05d5\u05d5\u05d4 \u05e9\u05d0\u05e0\u05df", "rooms": 2, "sqm": 42, "floor": 1, "price": 4800, "features": {"mamad": False, "elevator": False, "parking": False}},
            # Shapira (1 listing)
            {"id": "yad2-021", "address": "\u05e9\u05e4\u05d9\u05e8\u05d0 12", "area": "\u05e9\u05e4\u05d9\u05e8\u05d0", "rooms": 2.5, "sqm": 55, "floor": 2, "price": 5800, "features": {"mamad": False, "elevator": False, "parking": False}},
            # Kerem HaTeimanim (3 listings)
            {"id": "yad2-025", "address": "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd 5", "area": "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd", "rooms": 2, "sqm": 48, "floor": 1, "price": 7200, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-028", "address": "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd 18", "area": "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd", "rooms": 3, "sqm": 65, "floor": 2, "price": 10200, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-029", "address": "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd 30", "area": "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd", "rooms": 1, "sqm": 32, "floor": 1, "price": 5200, "features": {"mamad": False, "elevator": False, "parking": False}},
            # Montefiore (3 listings)
            {"id": "yad2-030", "address": "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9 15", "area": "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9", "rooms": 2, "sqm": 52, "floor": 2, "price": 8200, "features": {"mamad": False, "elevator": False, "parking": False}},
            {"id": "yad2-031", "address": "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9 8", "area": "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9", "rooms": 3, "sqm": 75, "floor": 3, "price": 11200, "features": {"mamad": True, "elevator": True, "parking": False}},
            {"id": "yad2-032", "address": "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9 22", "area": "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9", "rooms": 4, "sqm": 95, "floor": 4, "price": 14800, "features": {"mamad": True, "elevator": True, "parking": True}},
            # Sarona (1 listing)
            {"id": "yad2-033", "address": "\u05e9\u05e8\u05d5\u05e0\u05d4 5", "area": "\u05e9\u05e8\u05d5\u05e0\u05d4", "rooms": 2, "sqm": 55, "floor": 8, "price": 11500, "features": {"mamad": True, "elevator": True, "parking": True}},
            # Ajami (1 listing)
            {"id": "yad2-034", "address": "\u05e2\u05d2'\u05de\u05d9 45", "area": "\u05e2\u05d2'\u05de\u05d9", "rooms": 3, "sqm": 70, "floor": 2, "price": 7000, "features": {"mamad": False, "elevator": False, "parking": False}},
            # Yad Eliyahu (1 listing)
            {"id": "yad2-035", "address": "\u05d9\u05d3 \u05d0\u05dc\u05d9\u05d4\u05d5 20", "area": "\u05d9\u05d3 \u05d0\u05dc\u05d9\u05d4\u05d5", "rooms": 2, "sqm": 50, "floor": 3, "price": 6300, "features": {"mamad": False, "elevator": False, "parking": False}},
        ]

        now = datetime.utcnow()
        count = 0

        # Mark existing active listings for staleness check
        existing_ids = set()
        active_listings = session.exec(
            select(RentalListing).where(RentalListing.is_active == True)  # noqa: E712
        ).all()
        for listing in active_listings:
            existing_ids.add(listing.id)

        scraped_ids = set()
        for item in seed_listings:
            neighborhood_id = self._guess_neighborhood(item["address"], item.get("area"))
            sqm = item.get("sqm")
            price_per_sqm = round(item["price"] / sqm, 1) if sqm else None

            db_listing = session.get(RentalListing, item["id"])
            if db_listing:
                db_listing.last_seen = now
                db_listing.price = item["price"]
                db_listing.is_active = True
                if db_listing.first_seen:
                    db_listing.days_on_market = (now - db_listing.first_seen).days
            else:
                db_listing = RentalListing(
                    id=item["id"],
                    neighborhood_id=neighborhood_id,
                    address=item.get("address"),
                    rooms=item["rooms"],
                    sqm=sqm,
                    floor=item.get("floor"),
                    price=item["price"],
                    price_per_sqm=price_per_sqm,
                    features=json.dumps(item.get("features", {})),
                    first_seen=now,
                    last_seen=now,
                    is_active=True,
                    days_on_market=0,
                )
                session.add(db_listing)

            scraped_ids.add(item["id"])
            count += 1

        # Mark listings not seen in this scrape as inactive
        for old_id in existing_ids - scraped_ids:
            old_listing = session.get(RentalListing, old_id)
            if old_listing:
                old_listing.is_active = False

        session.commit()
        log_scrape("Yad2", count)
        return count


if __name__ == "__main__":
    create_db_and_tables()
    scraper = Yad2Scraper()
    with Session(engine) as session:
        n = scraper.scrape_listings(session)
        print(f"Yad2: {n} listings")
