from __future__ import annotations

from typing import Any

from app.models.holding import Holding


def _holding_value(holding: Holding, prices: dict[str, float]) -> tuple[float, float]:
    """Return (invested, current_value) for a holding."""
    quantity = float(holding.quantity)
    buy_price = float(holding.buy_price)
    current_price = float(prices.get(holding.symbol, buy_price))
    invested = quantity * buy_price
    value = quantity * current_price
    return invested, value


def get_portfolio_analytics(holdings: list[Holding], prices: dict[str, float]) -> dict[str, Any]:
    """Compute portfolio analytics from holdings and live prices."""
    if not holdings:
        return {
            "total_value": 0.0,
            "total_invested": 0.0,
            "total_pnl": 0.0,
            "total_pnl_pct": 0.0,
            "best_performer": None,
            "worst_performer": None,
            "holdings_count": 0,
            "portfolio_allocation": [],
        }

    total_invested = 0.0
    total_value = 0.0
    performers: list[dict[str, Any]] = []
    allocation: list[dict[str, Any]] = []

    for holding in holdings:
        invested, value = _holding_value(holding, prices)
        pnl = value - invested
        pnl_pct = (pnl / invested * 100.0) if invested > 0 else 0.0

        total_invested += invested
        total_value += value
        performers.append({"symbol": holding.symbol, "pnl_pct": round(pnl_pct, 4)})
        allocation.append({"symbol": holding.symbol, "value": value})

    total_pnl = total_value - total_invested
    total_pnl_pct = (total_pnl / total_invested * 100.0) if total_invested > 0 else 0.0

    best = max(performers, key=lambda x: x["pnl_pct"])
    worst = min(performers, key=lambda x: x["pnl_pct"])

    portfolio_allocation = []
    if total_value > 0:
        portfolio_allocation = [
            {
                "symbol": item["symbol"],
                "percentage": round((item["value"] / total_value) * 100.0, 2),
            }
            for item in sorted(allocation, key=lambda x: x["value"], reverse=True)
        ]

    return {
        "total_value": round(total_value, 2),
        "total_invested": round(total_invested, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl_pct, 2),
        "best_performer": best,
        "worst_performer": worst,
        "holdings_count": len(holdings),
        "portfolio_allocation": portfolio_allocation,
    }


def _sector_distribution(holdings: list[Holding], prices: dict[str, float], total_value: float) -> list[dict[str, Any]]:
    sector_totals: dict[str, float] = {}
    for holding in holdings:
        _, value = _holding_value(holding, prices)
        sector = (holding.sector or "").strip() or "Unknown"
        sector_totals[sector] = sector_totals.get(sector, 0.0) + value

    if total_value <= 0:
        return []

    return [
        {
            "sector": sector,
            "value": round(value, 2),
            "percentage": round((value / total_value) * 100.0, 2),
        }
        for sector, value in sorted(sector_totals.items(), key=lambda x: x[1], reverse=True)
    ]


def _diversification_score(holdings_count: int, sector_distribution: list[dict[str, Any]]) -> float:
    if holdings_count <= 2:
        score = 20.0
    elif holdings_count <= 4:
        score = 40.0
    elif holdings_count <= 7:
        score = 60.0
    elif holdings_count <= 10:
        score = 80.0
    else:
        score = 100.0

    if sector_distribution:
        max_sector_pct = max(item["percentage"] for item in sector_distribution)
        if max_sector_pct > 70:
            score = max(0.0, score - 20.0)

    return round(score, 2)


def _concentration_risk(holdings: list[Holding], prices: dict[str, float], total_value: float) -> tuple[float, float]:
    if not holdings or total_value <= 0:
        return 0.0, 0.0

    weights = []
    for holding in holdings:
        _, value = _holding_value(holding, prices)
        pct = (value / total_value) * 100.0
        weights.append(pct)

    top_pct = max(weights)
    return round(top_pct, 2), round(top_pct, 2)


def _health_score(
    holdings_count: int,
    top_holding_pct: float,
    sector_count: int,
    diversification_score: float,
) -> float:
    score = 100.0

    if holdings_count < 3:
        score -= 20.0
    if top_holding_pct > 50:
        score -= 15.0
    elif top_holding_pct > 30:
        score -= 10.0
    if sector_count < 2:
        score -= 15.0
    elif sector_count < 3:
        score -= 10.0

    # Reward diversification
    score += (diversification_score - 50.0) * 0.2

    return round(max(0.0, min(100.0, score)), 2)


def _risk_level(health_score: float) -> str:
    if health_score > 70:
        return "Low"
    if health_score > 40:
        return "Medium"
    return "High"


def _risk_factors(
    holdings_count: int,
    top_holding_pct: float,
    sector_count: int,
    sector_distribution: list[dict[str, Any]],
) -> list[str]:
    factors: list[str] = []

    if holdings_count < 3:
        factors.append("Insufficient holdings for diversification")
    if top_holding_pct > 50:
        factors.append("Portfolio concentrated in single stock")
    elif top_holding_pct > 30:
        factors.append("High weight in top holding increases concentration risk")
    if sector_count < 2:
        factors.append("Limited sector diversification")
    elif sector_count < 3:
        factors.append("Portfolio spans few sectors — consider broader exposure")

    if sector_distribution:
        max_sector = max(sector_distribution, key=lambda x: x["percentage"])
        if max_sector["percentage"] > 70:
            factors.append(f"Overexposure to {max_sector['sector']} sector")

    if not factors:
        factors.append("Portfolio risk profile is within acceptable ranges")

    return factors


def get_portfolio_risk(holdings: list[Holding], prices: dict[str, float]) -> dict[str, Any]:
    """Compute portfolio risk metrics from holdings and live prices."""
    if not holdings:
        return {
            "health_score": 0.0,
            "diversification_score": 0.0,
            "concentration_risk": 0.0,
            "top_holding_pct": 0.0,
            "sector_distribution": [],
            "holdings_count": 0,
            "risk_level": "High",
            "risk_factors": ["Insufficient holdings for diversification"],
        }

    total_value = sum(_holding_value(h, prices)[1] for h in holdings)
    sector_distribution = _sector_distribution(holdings, prices, total_value)
    sector_count = len(sector_distribution)
    diversification_score = _diversification_score(len(holdings), sector_distribution)
    concentration_risk, top_holding_pct = _concentration_risk(holdings, prices, total_value)
    health_score = _health_score(
        len(holdings),
        top_holding_pct,
        sector_count,
        diversification_score,
    )

    return {
        "health_score": health_score,
        "diversification_score": diversification_score,
        "concentration_risk": concentration_risk,
        "top_holding_pct": top_holding_pct,
        "sector_distribution": sector_distribution,
        "holdings_count": len(holdings),
        "risk_level": _risk_level(health_score),
        "risk_factors": _risk_factors(
            len(holdings),
            top_holding_pct,
            sector_count,
            sector_distribution,
        ),
    }
