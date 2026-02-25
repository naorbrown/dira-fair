"""Rent scoring engine.

Compares a user's rent to the market distribution in their neighborhood
using active Yad2 listings as comparables.
"""

import statistics

from sqlmodel import Session, select

from api.models import CBSRentStat, RentalListing


def score_rent(
    neighborhood_id: str,
    rooms: float,
    sqm: float,
    monthly_rent: int,
    session: Session,
) -> dict:
    """Score a user's rent against the market.

    Returns dict with: score, percentile, market_avg, delta_pct
    """
    # Find comparable listings: same neighborhood, similar room count
    comps = session.exec(
        select(RentalListing).where(
            RentalListing.neighborhood_id == neighborhood_id,
            RentalListing.is_active == True,  # noqa: E712
            RentalListing.rooms >= rooms - 0.5,
            RentalListing.rooms <= rooms + 0.5,
        )
    ).all()

    if len(comps) >= 5:
        prices = sorted([c.price for c in comps])
        market_avg = int(statistics.mean(prices))

        # Calculate percentile
        below_count = sum(1 for p in prices if p < monthly_rent)
        equal_count = sum(1 for p in prices if p == monthly_rent)
        percentile = int(((below_count + 0.5 * equal_count) / len(prices)) * 100)
    else:
        # Fallback to CBS city-level data
        cbs_stat = session.exec(
            select(CBSRentStat)
            .where(
                CBSRentStat.city == "\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1-\u05d9\u05e4\u05d5",
                CBSRentStat.rooms == round(rooms * 2) / 2,  # Round to nearest 0.5
                CBSRentStat.tenant_type == "all",
            )
            .order_by(CBSRentStat.fetched_at.desc())
        ).first()

        if cbs_stat:
            market_avg = cbs_stat.avg_rent
            # Rough percentile estimate from CBS average
            ratio = monthly_rent / market_avg
            percentile = min(99, max(1, int(ratio * 50)))
        else:
            market_avg = 8000  # Hardcoded TLV fallback
            percentile = 50

    delta_pct = round(((monthly_rent - market_avg) / market_avg) * 100, 1)

    if percentile < 40:
        score = "below_market"
    elif percentile <= 60:
        score = "at_market"
    else:
        score = "above_market"

    return {
        "score": score,
        "percentile": percentile,
        "market_avg": market_avg,
        "delta_pct": delta_pct,
    }
