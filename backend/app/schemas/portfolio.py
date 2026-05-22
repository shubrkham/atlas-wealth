import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PortfolioCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    currency: str = Field(default="USD", min_length=3, max_length=3)


class PortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    currency: str
    created_at: datetime
    user_id: uuid.UUID
