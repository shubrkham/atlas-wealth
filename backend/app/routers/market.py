from fastapi import APIRouter, Depends, Query
from app.services import market_service
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/quote")
async def get_quote(
    symbol: str = Query(..., min_length=1, max_length=20),
    _: dict = Depends(get_current_user),
) -> dict:
    return await market_service.get_quote(symbol.upper())


@router.get("/quotes")
async def get_multiple_quotes(
    symbols: str = Query(..., description="Comma-separated symbols e.g. AAPL,MSFT"),
    _: dict = Depends(get_current_user),
) -> dict:
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    return await market_service.get_multiple_quotes(symbol_list)


@router.get("/search")
async def search_market(
    q: str = Query(..., min_length=1, max_length=100),
    _: dict = Depends(get_current_user),
) -> dict:
    return await market_service.search_symbols(q)