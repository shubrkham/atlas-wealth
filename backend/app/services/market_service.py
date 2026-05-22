"""Market data service using Alpha Vantage API."""

import httpx
from app.config import settings

BASE_URL = "https://www.alphavantage.co/query"


async def get_quote(symbol: str) -> dict:
    """Fetch real-time quote for a stock symbol."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            BASE_URL,
            params={
                "function": "GLOBAL_QUOTE",
                "symbol": symbol.upper(),
                "apikey": settings.ALPHA_VANTAGE_KEY,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()

        quote = data.get("Global Quote", {})

        if not quote or not quote.get("05. price"):
            return {
                "symbol": symbol.upper(),
                "price": None,
                "change": None,
                "change_pct": None,
                "volume": None,
                "error": "Symbol not found or API limit reached",
            }

        return {
            "symbol": quote.get("01. symbol", symbol.upper()),
            "price": float(quote.get("05. price", 0)),
            "change": float(quote.get("09. change", 0)),
            "change_pct": float(
                quote.get("10. change percent", "0%").replace("%", "")
            ),
            "volume": int(quote.get("06. volume", 0)),
            "previous_close": float(quote.get("08. previous close", 0)),
            "open": float(quote.get("02. open", 0)),
            "high": float(quote.get("03. high", 0)),
            "low": float(quote.get("04. low", 0)),
        }


async def get_multiple_quotes(symbols: list[str]) -> dict[str, dict]:
    """Fetch quotes for multiple symbols. Returns dict keyed by symbol."""
    results = {}
    for symbol in symbols:
        try:
            quote = await get_quote(symbol)
            results[symbol.upper()] = quote
        except Exception:
            results[symbol.upper()] = {
                "symbol": symbol.upper(),
                "price": None,
                "change": None,
                "change_pct": None,
                "error": "Failed to fetch",
            }
    return results


async def search_symbols(query: str) -> dict:
    """Search for stock symbols by keyword."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            BASE_URL,
            params={
                "function": "SYMBOL_SEARCH",
                "keywords": query,
                "apikey": settings.ALPHA_VANTAGE_KEY,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()

        matches = data.get("bestMatches", [])
        return {
            "query": query,
            "results": [
                {
                    "symbol": m.get("1. symbol", ""),
                    "name": m.get("2. name", ""),
                    "type": m.get("3. type", ""),
                    "region": m.get("4. region", ""),
                    "currency": m.get("8. currency", ""),
                }
                for m in matches[:8]
            ],
        }