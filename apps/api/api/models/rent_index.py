from datetime import date

from sqlmodel import Field, SQLModel


class RentIndex(SQLModel, table=True):
    __tablename__ = "rent_index"
    id: int | None = Field(default=None, primary_key=True)
    date: date
    index_value: float
    yoy_change: float
