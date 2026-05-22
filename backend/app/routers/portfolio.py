import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user_dependency
from app.models.portfolio import Portfolio
from app.models.user import User
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse
from app.services.portfolio_service import get_portfolio_for_user

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("", response_model=list[PortfolioResponse])
async def list_portfolios(
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> list[PortfolioResponse]:
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == current_user.id)
        .order_by(Portfolio.created_at.desc())
    )
    portfolios = result.scalars().all()
    return [PortfolioResponse.model_validate(p) for p in portfolios]


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    payload: PortfolioCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> PortfolioResponse:
    portfolio = Portfolio(
        user_id=current_user.id,
        name=payload.name,
        currency=payload.currency.upper(),
    )
    db.add(portfolio)
    await db.flush()
    await db.refresh(portfolio)
    return PortfolioResponse.model_validate(portfolio)


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: uuid.UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> PortfolioResponse:
    portfolio = await get_portfolio_for_user(db, portfolio_id, current_user)
    return PortfolioResponse.model_validate(portfolio)


@router.delete("/{portfolio_id}", status_code=status.HTTP_200_OK)
async def delete_portfolio(
    portfolio_id: uuid.UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    portfolio = await get_portfolio_for_user(db, portfolio_id, current_user)
    await db.delete(portfolio)
    await db.flush()
    return {"message": "Portfolio deleted successfully"}
