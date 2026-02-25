from datetime import datetime

import pytest
from sqlmodel import Session, SQLModel, create_engine

from api.models import CBSRentStat, Neighborhood, RentalListing
from api.services.rent_scorer import score_rent


@pytest.fixture
def session():
    engine = create_engine("sqlite://", echo=False)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Seed a neighborhood
        hood = Neighborhood(
            id="florentin",
            name_en="Florentin",
            name_he="\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df",
            lat=32.056,
            lng=34.769,
        )
        session.add(hood)

        # Seed Yad2 listings
        for i, price in enumerate(
            [5000, 5500, 5800, 6000, 6200, 6500, 7000, 7500, 8000, 8500]
        ):
            session.add(
                RentalListing(
                    id=f"test-{i}",
                    neighborhood_id="florentin",
                    rooms=2,
                    sqm=50,
                    price=price,
                    price_per_sqm=price / 50,
                    is_active=True,
                    first_seen=datetime.utcnow(),
                    last_seen=datetime.utcnow(),
                )
            )

        # Seed CBS fallback
        session.add(
            CBSRentStat(
                city="\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1-\u05d9\u05e4\u05d5",
                rooms=2,
                avg_rent=6500,
                period="2025-Q4",
                tenant_type="all",
            )
        )

        session.commit()
        yield session


def test_below_market(session):
    result = score_rent("florentin", rooms=2, sqm=50, monthly_rent=5200, session=session)
    assert result["score"] == "below_market"
    assert result["percentile"] < 40


def test_at_market(session):
    result = score_rent("florentin", rooms=2, sqm=50, monthly_rent=6200, session=session)
    assert result["score"] == "at_market"
    assert 40 <= result["percentile"] <= 60


def test_above_market(session):
    result = score_rent("florentin", rooms=2, sqm=50, monthly_rent=8200, session=session)
    assert result["score"] == "above_market"
    assert result["percentile"] > 60


def test_fallback_to_cbs(session):
    """When no Yad2 data for a neighborhood, fall back to CBS."""
    result = score_rent("old-north", rooms=2, sqm=50, monthly_rent=7000, session=session)
    # Should still return a result using CBS data
    assert result["score"] in ("below_market", "at_market", "above_market")
    assert result["market_avg"] == 6500  # CBS fallback
