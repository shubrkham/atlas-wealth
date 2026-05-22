import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class HoldingCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    company_name: str = Field(..., max_length=255)
    quantity: Decimal = Field(..., gt=0)
    buy_price: Decimal = Field(..., gt=0)
    buy_date: date
    sector: str | None = Field(default=None, max_length=100)

    @field_validator("symbol")
    @classmethod
    def uppercase_symbol(cls, value: str) -> str:
        return value.upper()


class HoldingUpdate(BaseModel):
    quantity: Decimal | None = Field(default=None, gt=0)
    buy_price: Decimal | None = Field(default=None, gt=0)
    buy_date: date | None = None
    sector: str | None = Field(default=None, max_length=100)


class HoldingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    portfolio_id: uuid.UUID
    symbol: str
    company_name: str | None
    quantity: Decimal
    buy_price: Decimal
    buy_date: date | None
    sector: str | None
    created_at: datetime
