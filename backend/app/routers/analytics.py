import uuid

from fastapi import APIRouter

from app.services import analytics_service

router = APIRouter(prefix="/portfolios", tags=["analytics"])


@router.get("/{portfolio_id}/analytics")
async def get_analytics(portfolio_id: uuid.UUID) -> dict:
    return await analytics_service.get_portfolio_analytics(portfolio_id)


@router.get("/{portfolio_id}/risk")
async def get_risk(portfolio_id: uuid.UUID) -> dict:
    return await analytics_service.get_portfolio_risk(portfolio_id)
