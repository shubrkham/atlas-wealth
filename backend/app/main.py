from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analytics, auth, holdings, market, portfolio, watchlist

app = FastAPI(title="Kadam Capital API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "https://atlas-wealth.vercel.app",
        "https://atlas-wealth-two.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(portfolio.router, prefix=API_PREFIX)
app.include_router(holdings.router, prefix=API_PREFIX)
app.include_router(analytics.router, prefix=API_PREFIX)
app.include_router(market.router, prefix=API_PREFIX)
app.include_router(watchlist.router, prefix=API_PREFIX)


@app.get("/")
async def health_check() -> dict[str, str]:
    return {"status": "Kadam Capital API is running"}
