import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user_dependency
from app.models.holding import Holding
from app.models.user import User
from app.schemas.holding import HoldingCreate, HoldingResponse, HoldingUpdate
from app.services.portfolio_service import (
    create_transaction,
    get_holding_for_portfolio,
    get_portfolio_for_user,
)

router = APIRouter(prefix="/portfolios", tags=["holdings"])


@router.get("/{portfolio_id}/holdings", response_model=list[HoldingResponse])
async def list_holdings(
    portfolio_id: uuid.UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> list[HoldingResponse]:
    await get_portfolio_for_user(db, portfolio_id, current_user)
    result = await db.execute(
        select(Holding)
        .where(Holding.portfolio_id == portfolio_id)
        .order_by(Holding.created_at.desc())
    )
    holdings = result.scalars().all()
    return [HoldingResponse.model_validate(h) for h in holdings]


@router.post(
    "/{portfolio_id}/holdings",
    response_model=HoldingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_holding(
    portfolio_id: uuid.UUID,
    payload: HoldingCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> HoldingResponse:
    await get_portfolio_for_user(db, portfolio_id, current_user)

    holding = Holding(
        portfolio_id=portfolio_id,
        symbol=payload.symbol,
        company_name=payload.company_name,
        quantity=payload.quantity,
        buy_price=payload.buy_price,
        buy_date=payload.buy_date,
        sector=payload.sector,
    )
    db.add(holding)
    await db.flush()

    await create_transaction(
        db,
        holding_id=holding.id,
        portfolio_id=portfolio_id,
        transaction_type="BUY",
        quantity=holding.quantity,
        price=holding.buy_price,
    )

    await db.refresh(holding)
    return HoldingResponse.model_validate(holding)


@router.put("/{portfolio_id}/holdings/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    payload: HoldingUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> HoldingResponse:
    holding = await get_holding_for_portfolio(
        db, portfolio_id, holding_id, current_user
    )

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return HoldingResponse.model_validate(holding)

    for field, value in update_data.items():
        setattr(holding, field, value)

    await db.flush()

    await create_transaction(
        db,
        holding_id=holding.id,
        portfolio_id=portfolio_id,
        transaction_type="UPDATE",
        quantity=holding.quantity,
        price=holding.buy_price,
    )

    await db.refresh(holding)
    return HoldingResponse.model_validate(holding)


@router.delete(
    "/{portfolio_id}/holdings/{holding_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_holding(
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    holding = await get_holding_for_portfolio(
        db, portfolio_id, holding_id, current_user
    )

    await create_transaction(
        db,
        holding_id=holding.id,
        portfolio_id=portfolio_id,
        transaction_type="SELL",
        quantity=holding.quantity,
        price=holding.buy_price,
    )

    await db.delete(holding)
    await db.flush()
    return {"message": "Holding deleted successfully"}
