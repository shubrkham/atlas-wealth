import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user_dependency
from app.models.holding import Holding
from app.models.user import User
from app.services import analytics_service, market_service
from app.services.portfolio_service import get_portfolio_for_user

router = APIRouter(prefix="/portfolios", tags=["analytics"])


async def _load_holdings_and_prices(
    db: AsyncSession,
    portfolio_id: uuid.UUID,
    user: User,
) -> tuple[list[Holding], dict[str, float]]:
    await get_portfolio_for_user(db, portfolio_id, user)

    result = await db.execute(
        select(Holding).where(Holding.portfolio_id == portfolio_id)
    )
    holdings = list(result.scalars().all())

    symbols = [holding.symbol for holding in holdings]
    quotes = await market_service.get_multiple_quotes(symbols) if symbols else {}

    prices: dict[str, float] = {}
    for holding in holdings:
        quote = quotes.get(holding.symbol, {})
        price = quote.get("price")
        prices[holding.symbol] = float(price) if price is not None else float(holding.buy_price)

    return holdings, prices


@router.get("/{portfolio_id}/analytics")
async def get_analytics(
    portfolio_id: uuid.UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> dict:
    holdings, prices = await _load_holdings_and_prices(db, portfolio_id, current_user)
    return analytics_service.get_portfolio_analytics(holdings, prices)


@router.get("/{portfolio_id}/risk")
async def get_risk(
    portfolio_id: uuid.UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> dict:
    holdings, prices = await _load_holdings_and_prices(db, portfolio_id, current_user)
    return analytics_service.get_portfolio_risk(holdings, prices)
