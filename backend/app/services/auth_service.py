from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserLogin, UserRegister


async def get_or_create_user(
    db: AsyncSession,
    clerk_id: str,
    email: str,
    full_name: str | None,
) -> tuple[User, bool]:
    """
    Return an existing user by clerk_id, or create a new one.
    Returns (user, created) where created is True if a new row was inserted.
    """
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()

    if user is not None:
        return user, False

    user = User(
        clerk_id=clerk_id,
        email=email,
        full_name=full_name,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user, True


async def create_or_update_user(
    db: AsyncSession,
    clerk_id: str,
    email: str,
    full_name: str | None,
) -> User:
    """Upsert a user record keyed by clerk_id."""
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            clerk_id=clerk_id,
            email=email,
            full_name=full_name,
        )
        db.add(user)
    else:
        user.email = email
        user.full_name = full_name

    await db.flush()
    await db.refresh(user)
    return user


async def register_user(payload: UserRegister) -> dict:
    return {"message": "Registration not implemented", "email": payload.email}


async def login_user(payload: UserLogin) -> dict:
    return {"message": "Login not implemented", "email": payload.email}
