from functools import lru_cache
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User

security = HTTPBearer()


@lru_cache(maxsize=1)
def _fetch_jwks() -> dict[str, Any]:
    response = httpx.get(settings.clerk_jwks_url, timeout=10.0)
    response.raise_for_status()
    return response.json()


def _verify_clerk_jwt(token: str) -> dict[str, Any]:
    """Verify a Clerk session JWT and return its claims."""
    try:
        jwks = _fetch_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = next(
            (key for key in jwks["keys"] if key["kid"] == unverified_header.get("kid")),
            None,
        )
        if rsa_key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find matching Clerk public key",
            )

        public_key = jwk.construct(rsa_key)
        return jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            options={"verify_aud": False},
        )
    except HTTPException:
        raise
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch Clerk public keys",
        ) from exc


def get_clerk_id_from_token(token: str) -> str:
    """Extract clerk_id (JWT `sub`) after verification."""
    claims = _verify_clerk_jwt(token)
    clerk_id = claims.get("sub")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing subject",
        )
    return clerk_id


async def get_current_user(token: str, db: AsyncSession) -> User:
    """
    Verify the Clerk JWT, resolve clerk_id, and return the matching DB user.
    Raises 401 if the token is invalid or the user is not synced yet.
    """
    clerk_id = get_clerk_id_from_token(token)

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Call /api/v1/auth/sync first.",
        )

    return user


async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency wrapper for protected routes."""
    return await get_current_user(credentials.credentials, db)
