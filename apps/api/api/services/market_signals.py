"""Market signal analysis.

Computes trend direction, seasonal favorability, days-on-market,
supply levels, and generates negotiation tips.
"""

from datetime import date

from sqlmodel import Session, func, select

from api.models import RentalListing, RentIndex

SEASONAL_FAVORABILITY = {
    1: "good_to_negotiate",
    2: "good_to_negotiate",
    3: "neutral",
    4: "neutral",
    5: "neutral",
    6: "neutral",
    7: "bad_to_negotiate",
    8: "bad_to_negotiate",
    9: "bad_to_negotiate",
    10: "neutral",
    11: "good_to_negotiate",
    12: "good_to_negotiate",
}


def get_signals(neighborhood_id: str, rooms: float, session: Session) -> dict:
    """Compute market signals for a neighborhood."""
    # Active supply count
    active_count = session.exec(
        select(func.count(RentalListing.id)).where(
            RentalListing.neighborhood_id == neighborhood_id,
            RentalListing.is_active == True,  # noqa: E712
        )
    ).one()

    # Average days on market
    avg_dom_result = session.exec(
        select(func.avg(RentalListing.days_on_market)).where(
            RentalListing.neighborhood_id == neighborhood_id,
            RentalListing.is_active == True,  # noqa: E712
            RentalListing.days_on_market != None,  # noqa: E711
        )
    ).one()
    avg_dom = round(avg_dom_result, 1) if avg_dom_result else None

    # Trend from rent index
    recent_indices = session.exec(select(RentIndex).order_by(RentIndex.date.desc()).limit(6)).all()

    if len(recent_indices) >= 2:
        latest = recent_indices[0].index_value
        three_months_ago = recent_indices[min(2, len(recent_indices) - 1)].index_value
        if latest > three_months_ago * 1.005:
            trend = "rising"
        elif latest < three_months_ago * 0.995:
            trend = "falling"
        else:
            trend = "stable"
    else:
        trend = "unknown"

    # Seasonal
    season = SEASONAL_FAVORABILITY.get(date.today().month, "neutral")

    # Comparable listings for the user to see
    comps = session.exec(
        select(RentalListing)
        .where(
            RentalListing.neighborhood_id == neighborhood_id,
            RentalListing.is_active == True,  # noqa: E712
            RentalListing.rooms >= rooms - 0.5,
            RentalListing.rooms <= rooms + 0.5,
        )
        .order_by(RentalListing.price)
        .limit(5)
    ).all()

    comparable_listings = [
        {
            "address": c.address,
            "rooms": c.rooms,
            "sqm": c.sqm,
            "price": c.price,
            "days_on_market": c.days_on_market,
        }
        for c in comps
    ]

    return {
        "trend": trend,
        "season": season,
        "renewal_discount": 2.8,  # CBS average
        "avg_days_on_market": avg_dom,
        "active_supply": active_count,
        "comparable_listings": comparable_listings,
    }


def generate_tips(score: str, signals: dict) -> list[str]:
    """Generate negotiation tips based on score and market signals."""
    tips = []

    if score == "above_market":
        tips.append(
            "Your rent is above the market average for similar apartments in your neighborhood. "
            "You have a strong case to negotiate a reduction at renewal time."
        )
    elif score == "at_market":
        tips.append(
            "Your rent is in line with the market. While a significant reduction is unlikely, "
            "you may be able to negotiate keeping the same price instead of an increase."
        )
    else:
        tips.append(
            "Your rent is below the market average \u2014 you're getting a good deal. "
            "Focus on maintaining your current rate rather than pushing for a reduction."
        )

    # Seasonal tips
    if signals["season"] == "good_to_negotiate":
        tips.append(
            "Timing is in your favor \u2014 demand is lower this time of year. "
            "Landlords are more motivated to keep existing tenants."
        )
    elif signals["season"] == "bad_to_negotiate":
        tips.append(
            "This is peak rental season (Jul-Sep). If possible, consider "
            "negotiating a short extension and renegotiating in winter "
            "when you'll have more leverage."
        )

    # Supply tips
    if signals["active_supply"] > 10:
        tips.append(
            f"There are {signals['active_supply']} active listings in your neighborhood \u2014 "
            "healthy supply gives you alternatives and strengthens your negotiation position."
        )
    elif signals["active_supply"] < 5:
        tips.append(
            "Supply is tight in your neighborhood right now. "
            "Your landlord knows apartments move fast, so focus on other negotiation angles."
        )

    # Days on market
    if signals.get("avg_days_on_market") and signals["avg_days_on_market"] > 14:
        avg_dom = signals["avg_days_on_market"]
        tips.append(
            f"Listings in your area sit for an average of {avg_dom:.0f} "
            "days \u2014 landlords are having trouble finding tenants, "
            "which is leverage for you."
        )

    # Trend tips
    if signals["trend"] == "falling":
        tips.append(
            "Rents in Tel Aviv are trending downward. "
            "Point to this trend when negotiating \u2014 your landlord "
            "should consider the broader market."
        )
    elif signals["trend"] == "rising":
        tips.append(
            "Rents are trending upward city-wide, but your specific "
            "neighborhood and timing matter more. "
            "Focus on comparable apartments nearby, not city-wide trends."
        )

    # Renewal discount
    discount = signals["renewal_discount"]
    tips.append(
        f"CBS data shows renewing tenants pay ~{discount}% less than "
        "new tenants. Remind your landlord that turnover costs them "
        "\u2014 vacancy, cleaning, repairs, broker fees."
    )

    return tips
