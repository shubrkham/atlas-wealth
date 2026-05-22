import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WatchlistItemBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    company_name: str | None = Field(default=None, max_length=255)


class WatchlistItemCreate(WatchlistItemBase):
    pass


class WatchlistItemUpdate(BaseModel):
    symbol: str | None = Field(default=None, min_length=1, max_length=20)
    company_name: str | None = Field(default=None, max_length=255)


class WatchlistItemResponse(WatchlistItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    added_at: datetime
