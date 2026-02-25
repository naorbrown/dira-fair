from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from api.database import get_session
from api.models import Neighborhood, RentalListing, SaleTransaction

router = APIRouter(prefix="/neighborhoods", tags=["neighborhoods"])


@router.get("")
def list_neighborhoods(session: Session = Depends(get_session)):
    neighborhoods = session.exec(select(Neighborhood).order_by(Neighborhood.name_en)).all()
    return neighborhoods


@router.get("/{slug}")
def get_neighborhood(slug: str, session: Session = Depends(get_session)):
    neighborhood = session.get(Neighborhood, slug)
    if not neighborhood:
        raise HTTPException(status_code=404, detail="Neighborhood not found")

    listings = session.exec(
        select(RentalListing)
        .where(RentalListing.neighborhood_id == slug, RentalListing.is_active == True)  # noqa: E712
        .order_by(RentalListing.last_seen.desc())
        .limit(20)
    ).all()

    transactions = session.exec(
        select(SaleTransaction)
        .where(SaleTransaction.neighborhood_id == slug)
        .order_by(SaleTransaction.deal_date.desc())
        .limit(20)
    ).all()

    return {
        "neighborhood": neighborhood,
        "active_listings": listings,
        "recent_transactions": transactions,
    }
