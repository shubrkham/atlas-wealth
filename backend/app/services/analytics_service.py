import uuid
from decimal import Decimal
from typing import Any

from app.models.holding import Holding


def get_portfolio_summary(
    holdings: list[Holding],
    market_prices: dict[str, Decimal | float | int],
) -> dict[str, Any]:
    """
    Compute portfolio totals and best/worst performers by P&L %.
    market_prices maps symbol -> current price (falls back to buy_price if missing).
    """
    if not holdings:
        return {
            "total_invested": Decimal("0"),
            "total_value": Decimal("0"),
            "total_pnl": Decimal("0"),
            "total_pnl_pct": Decimal("0"),
            "best_performer": None,
            "worst_performer": None,
        }

    total_invested = Decimal("0")
    total_value = Decimal("0")
    performers: list[dict[str, Any]] = []

    for holding in holdings:
        quantity = Decimal(holding.quantity)
        buy_price = Decimal(holding.buy_price)
        invested = quantity * buy_price

        raw_current = market_prices.get(holding.symbol, buy_price)
        current_price = Decimal(str(raw_current))
        value = quantity * current_price
        pnl = value - invested
        pnl_pct = (pnl / invested * Decimal("100")) if invested else Decimal("0")

        total_invested += invested
        total_value += value
        performers.append(
            {
                "symbol": holding.symbol,
                "company_name": holding.company_name,
                "pnl_pct": pnl_pct,
            }
        )

    total_pnl = total_value - total_invested
    total_pnl_pct = (
        (total_pnl / total_invested * Decimal("100"))
        if total_invested
        else Decimal("0")
    )

    best = max(performers, key=lambda item: item["pnl_pct"])
    worst = min(performers, key=lambda item: item["pnl_pct"])

    return {
        "total_invested": total_invested,
        "total_value": total_value,
        "total_pnl": total_pnl,
        "total_pnl_pct": total_pnl_pct,
        "best_performer": best,
        "worst_performer": worst,
    }


async def get_portfolio_analytics(portfolio_id: uuid.UUID) -> dict:
    return {
        "portfolio_id": str(portfolio_id),
        "snapshots": [],
        "message": "Analytics snapshots not implemented",
    }


async def get_portfolio_risk(portfolio_id: uuid.UUID) -> dict:
    return {
        "portfolio_id": str(portfolio_id),
        "message": "Risk metrics not implemented",
    }
