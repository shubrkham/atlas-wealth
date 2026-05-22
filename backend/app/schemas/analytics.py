import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsSnapshotBase(BaseModel):
    snapshot_date: date
    total_value: Decimal = Field(..., ge=0)
    total_invested: Decimal = Field(..., ge=0)
    pnl: Decimal
    pnl_pct: Decimal


class AnalyticsSnapshotCreate(AnalyticsSnapshotBase):
    pass


class AnalyticsSnapshotUpdate(BaseModel):
    snapshot_date: date | None = None
    total_value: Decimal | None = Field(default=None, ge=0)
    total_invested: Decimal | None = Field(default=None, ge=0)
    pnl: Decimal | None = None
    pnl_pct: Decimal | None = None


class AnalyticsSnapshotResponse(AnalyticsSnapshotBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    portfolio_id: uuid.UUID


class RiskMetricsResponse(BaseModel):
    portfolio_id: uuid.UUID
    volatility: Decimal | None = None
    sharpe_ratio: Decimal | None = None
    max_drawdown: Decimal | None = None
    beta: Decimal | None = None
    message: str = "Risk metrics placeholder"
