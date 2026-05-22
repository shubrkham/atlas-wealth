from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_clerk_id_from_token
from app.schemas.user import UserLogin, UserRegister, UserResponse, UserSync
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()


@router.post("/register")
async def register(payload: UserRegister) -> dict:
    return await auth_service.register_user(payload)


@router.post("/login")
async def login(payload: UserLogin) -> dict:
    return await auth_service.login_user(payload)


@router.post("/sync", response_model=UserResponse)
async def sync_user(
    payload: UserSync,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Sync a Clerk user into the local users table.
    Requires a valid Clerk JWT; clerk_id in the body must match the token subject.
    """
    clerk_id_from_token = get_clerk_id_from_token(credentials.credentials)

    if payload.clerk_id != clerk_id_from_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="clerk_id does not match authenticated token",
        )

    user = await auth_service.create_or_update_user(
        db,
        clerk_id=payload.clerk_id,
        email=payload.email,
        full_name=payload.full_name,
    )
    return UserResponse.model_validate(user)
