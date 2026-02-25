from datetime import datetime

from sqlmodel import Field, SQLModel


class RentalListing(SQLModel, table=True):
    __tablename__ = "rental_listing"
    id: str = Field(primary_key=True)
    neighborhood_id: str | None = Field(default=None, foreign_key="neighborhood.id")
    address: str | None = None
    rooms: float
    sqm: float | None = None
    floor: int | None = None
    price: int
    price_per_sqm: float | None = None
    features: str | None = None
    first_seen: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    days_on_market: int | None = None
