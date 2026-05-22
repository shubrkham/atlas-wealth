import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction
from app.models.user import User


async def get_portfolio_for_user(
    db: AsyncSession,
    portfolio_id: uuid.UUID,
    user: User,
) -> Portfolio:
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id,
        )
    )
    portfolio = result.scalar_one_or_none()
    if portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
    return portfolio


async def get_holding_for_portfolio(
    db: AsyncSession,
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    user: User,
) -> Holding:
    await get_portfolio_for_user(db, portfolio_id, user)
    result = await db.execute(
        select(Holding).where(
            Holding.id == holding_id,
            Holding.portfolio_id == portfolio_id,
        )
    )
    holding = result.scalar_one_or_none()
    if holding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )
    return holding


async def create_transaction(
    db: AsyncSession,
    *,
    holding_id: uuid.UUID,
    portfolio_id: uuid.UUID,
    transaction_type: str,
    quantity: Decimal,
    price: Decimal,
) -> Transaction:
    transaction = Transaction(
        holding_id=holding_id,
        portfolio_id=portfolio_id,
        type=transaction_type,
        quantity=quantity,
        price=price,
        executed_at=datetime.now(timezone.utc),
    )
    db.add(transaction)
    await db.flush()
    return transaction
