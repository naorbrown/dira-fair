from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from api.database import get_session
from api.services.market_signals import generate_tips, get_signals
from api.services.rent_scorer import score_rent

router = APIRouter(tags=["rent-check"])


class RentCheckRequest(BaseModel):
    neighborhood_id: str
    rooms: float
    sqm: float
    monthly_rent: int


class MarketSignals(BaseModel):
    trend: str
    season: str
    renewal_discount: float
    avg_days_on_market: float | None
    active_supply: int
    comparable_listings: list[dict]


class RentCheckResponse(BaseModel):
    score: str
    percentile: int
    market_avg: int
    your_rent: int
    delta_pct: float
    signals: MarketSignals
    tips: list[str]


@router.post("/check", response_model=RentCheckResponse)
def check_rent(req: RentCheckRequest, session: Session = Depends(get_session)):
    result = score_rent(
        neighborhood_id=req.neighborhood_id,
        rooms=req.rooms,
        sqm=req.sqm,
        monthly_rent=req.monthly_rent,
        session=session,
    )
    signals = get_signals(req.neighborhood_id, req.rooms, session)
    tips = generate_tips(result["score"], signals)

    return RentCheckResponse(
        score=result["score"],
        percentile=result["percentile"],
        market_avg=result["market_avg"],
        your_rent=req.monthly_rent,
        delta_pct=result["delta_pct"],
        signals=MarketSignals(**signals),
        tips=tips,
    )
