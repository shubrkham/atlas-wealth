import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"
    __table_args__ = (
        UniqueConstraint(
            "portfolio_id",
            "snapshot_date",
            name="uq_analytics_portfolio_date",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    portfolio_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        nullable=False,
    )
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_value: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    total_invested: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    pnl: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    pnl_pct: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)

    portfolio: Mapped["Portfolio"] = relationship(
        "Portfolio",
        back_populates="analytics_snapshots",
    )
