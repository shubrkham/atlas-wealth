from fastapi import APIRouter, Depends, Query

from app.middleware.auth_middleware import get_current_user_dependency
from app.models.user import User
from app.services import market_service

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/quote")
async def get_quote(
    symbol: str = Query(..., min_length=1, max_length=20),
    _: User = Depends(get_current_user_dependency),
) -> dict:
    return await market_service.get_quote(symbol)


@router.get("/quotes")
async def get_quotes(
    symbols: str = Query(
        ...,
        description="Comma-separated symbols, e.g. AAPL,MSFT,GOOGL",
    ),
    _: User = Depends(get_current_user_dependency),
) -> dict[str, dict]:
    symbol_list = [part.strip() for part in symbols.split(",") if part.strip()]
    return await market_service.get_multiple_quotes(symbol_list)


@router.get("/search")
async def search_market(
    q: str = Query(..., min_length=1, max_length=100),
    _: User = Depends(get_current_user_dependency),
) -> dict:
    return await market_service.search_symbols(q)
