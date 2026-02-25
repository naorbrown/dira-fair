from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from api.database import get_session
from api.models import RentIndex

router = APIRouter(prefix="/stats", tags=["stats"])

SEASONAL_DATA = {
    "best_months": [11, 12, 1, 2],
    "worst_months": [7, 8, 9],
    "neutral_months": [3, 4, 5, 6, 10],
}


@router.get("/trends")
def get_trends(
    months: int = Query(default=24, ge=1, le=120),
    session: Session = Depends(get_session),
):
    cutoff = date.today() - timedelta(days=months * 30)
    entries = session.exec(
        select(RentIndex).where(RentIndex.date >= cutoff).order_by(RentIndex.date)
    ).all()
    return [
        {"date": e.date.isoformat(), "index": e.index_value, "yoy_change": e.yoy_change}
        for e in entries
    ]


@router.get("/seasonal")
def get_seasonal():
    current_month = date.today().month
    if current_month in SEASONAL_DATA["best_months"]:
        current = "good_to_negotiate"
    elif current_month in SEASONAL_DATA["worst_months"]:
        current = "bad_to_negotiate"
    else:
        current = "neutral"
    return {**SEASONAL_DATA, "current_month": current_month, "current": current}
