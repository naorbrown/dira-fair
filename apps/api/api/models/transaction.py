from datetime import date, datetime

from sqlmodel import Field, SQLModel


class SaleTransaction(SQLModel, table=True):
    __tablename__ = "sale_transaction"
    id: str = Field(primary_key=True)
    address: str
    neighborhood_id: str | None = Field(default=None, foreign_key="neighborhood.id")
    rooms: float
    sqm: float
    floor: int
    price: int
    price_per_sqm: int
    deal_date: date
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
