from datetime import datetime

from sqlmodel import Field, SQLModel


class CBSRentStat(SQLModel, table=True):
    __tablename__ = "cbs_rent_stat"
    id: int | None = Field(default=None, primary_key=True)
    city: str
    rooms: float
    avg_rent: int
    period: str
    tenant_type: str
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
