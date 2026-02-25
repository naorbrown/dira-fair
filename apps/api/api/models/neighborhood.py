from datetime import datetime

from sqlmodel import Field, SQLModel


class Neighborhood(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name_en: str
    name_he: str
    lat: float
    lng: float
    avg_rent_1br: int | None = None
    avg_rent_2br: int | None = None
    avg_rent_3br: int | None = None
    avg_rent_4br: int | None = None
    avg_price_sqm: int | None = None
    median_rent_sqm: float | None = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
