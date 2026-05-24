"""Market data service using the Alpha Vantage API."""

from __future__ import annotations

import httpx

from app.config import settings

BASE_URL = "https://www.alphavantage.co/query"


def _empty_quote(symbol: str, error: str) -> dict:
    return {
        "symbol": symbol.upper(),
        "price": None,
        "change": None,
        "change_pct": None,
        "volume": None,
        "error": error,
    }


def _parse_change_pct(raw: str | None) -> float | None:
    if not raw:
        return None
    try:
        return float(str(raw).replace("%", "").strip())
    except ValueError:
        return None


def _parse_global_quote(symbol: str, data: dict) -> dict:
    if data.get("Note") or data.get("Information"):
        return _empty_quote(symbol, "Alpha Vantage API rate limit reached. Try again shortly.")

    quote = data.get("Global Quote") or {}
    price_raw = quote.get("05. price")

    if not price_raw:
        return _empty_quote(symbol, "Symbol not found or quote unavailable")

    return {
        "symbol": str(quote.get("01. symbol", symbol)).upper(),
        "price": float(price_raw),
        "change": float(quote.get("09. change", 0) or 0),
        "change_pct": _parse_change_pct(quote.get("10. change percent")),
        "volume": int(float(quote.get("06. volume", 0) or 0)),
    }


async def get_quote(symbol: str) -> dict:
    """Fetch a live quote for a single symbol."""
    normalized = symbol.strip().upper()
    if not normalized:
        return _empty_quote(symbol, "Symbol is required")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            BASE_URL,
            params={
                "function": "GLOBAL_QUOTE",
                "symbol": normalized,
                "apikey": settings.ALPHA_VANTAGE_KEY,
            },
            timeout=15.0,
        )
        response.raise_for_status()
        return _parse_global_quote(normalized, response.json())


async def get_multiple_quotes(symbols: list[str]) -> dict[str, dict]:
    """Fetch quotes for multiple symbols sequentially."""
    results: dict[str, dict] = {}
    seen: set[str] = set()

    for symbol in symbols:
        normalized = symbol.strip().upper()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        try:
            results[normalized] = await get_quote(normalized)
        except httpx.HTTPError:
            results[normalized] = _empty_quote(normalized, "Failed to fetch quote")
        except Exception:
            results[normalized] = _empty_quote(normalized, "Unexpected error fetching quote")

    return results


async def search_symbols(query: str) -> dict:
    """Search for stock symbols by keyword."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            BASE_URL,
            params={
                "function": "SYMBOL_SEARCH",
                "keywords": query.strip(),
                "apikey": settings.ALPHA_VANTAGE_KEY,
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()

    if data.get("Note") or data.get("Information"):
        return {
            "query": query,
            "results": [],
            "error": "Alpha Vantage API rate limit reached. Try again shortly.",
        }

    matches = data.get("bestMatches") or []
    return {
        "query": query,
        "results": [
            {
                "symbol": match.get("1. symbol", ""),
                "name": match.get("2. name", ""),
                "type": match.get("3. type", ""),
                "region": match.get("4. region", ""),
                "currency": match.get("8. currency", ""),
            }
            for match in matches[:10]
        ],
    }
