from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import UserLogin, UserRegister, UserResponse, UserSync
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(payload: UserRegister) -> dict:
    return await auth_service.register_user(payload)


@router.post("/login")
async def login(payload: UserLogin) -> dict:
    return await auth_service.login_user(payload)


@router.post(
    "/sync",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Sync Clerk user into local database",
)
async def sync_user(
    payload: UserSync,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Create or return a user by clerk_id. No auth required — used on first app load.
    """
    user, _created = await auth_service.get_or_create_user(
        db,
        clerk_id=payload.clerk_id,
        email=payload.email,
        full_name=payload.full_name,
    )
    return UserResponse.model_validate(user)
