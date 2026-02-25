"""Authentication & token utilities.

Provides password hashing/verification, JWT token creation/verification,
and token blacklisting for session invalidation.
"""

import asyncio
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from typing import Any

import bcrypt
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db.crud_token_blacklist import crud_token_blacklist
from .schemas import TokenBlacklistCreate, TokenData

SECRET_KEY: SecretStr = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")


class TokenType(StrEnum):
    """JWT token type discriminator stored in the payload."""

    ACCESS = "access"
    REFRESH = "refresh"


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare a plain-text password against its bcrypt hash."""
    return await asyncio.to_thread(
        bcrypt.checkpw, plain_password.encode(), hashed_password.encode()
    )


def get_password_hash(password: str) -> str:
    """Return the bcrypt hash for *password*."""
    hashed_password: str = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    return hashed_password


async def lookup_user(db: AsyncSession, identifier: str) -> dict[str, Any] | None:
    """Look up a user by email (if contains '@') or username.

    Returns the user dict or ``None``.
    """
    from ..features.user.crud import crud_users  # lazy import to avoid circular

    if "@" in identifier:
        return await crud_users.get(db=db, email=identifier, is_deleted=False)
    return await crud_users.get(db=db, username=identifier, is_deleted=False)


async def authenticate_user(
    username_or_email: str, password: str, db: AsyncSession
) -> dict[str, Any] | None:
    """Validate credentials and return the user dict, or ``None`` on failure."""
    db_user = await lookup_user(db, username_or_email)
    if not db_user:
        return None

    if not await verify_password(password, db_user["hashed_password"]):
        return None

    return db_user


# ── Token creation ──────────────────────────────────────────────────


def _create_token(
    data: dict[str, Any], token_type: TokenType, expires_delta: timedelta | None = None
) -> str:
    """Create a signed JWT with the given *token_type* and expiration."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        default = (
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            if token_type == TokenType.ACCESS
            else timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )
        expire = datetime.now(UTC) + default
    to_encode.update({"exp": expire, "token_type": token_type})
    return jwt.encode(to_encode, SECRET_KEY.get_secret_value(), algorithm=ALGORITHM)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a short-lived access token."""
    return _create_token(data, TokenType.ACCESS, expires_delta)


def create_refresh_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a long-lived refresh token."""
    return _create_token(data, TokenType.REFRESH, expires_delta)


# ── Token verification & blacklisting ───────────────────────────────


async def verify_token(token: str, expected_token_type: TokenType, db: AsyncSession) -> TokenData | None:
    """Decode and validate a JWT. Returns ``None`` if invalid or blacklisted."""
    is_blacklisted = await crud_token_blacklist.exists(db, token=token)
    if is_blacklisted:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY.get_secret_value(), algorithms=[ALGORITHM])
        username_or_email: str | None = payload.get("sub")
        token_type: str | None = payload.get("token_type")

        if username_or_email is None or token_type != expected_token_type:
            return None

        return TokenData(username_or_email=username_or_email)

    except JWTError:
        return None


async def blacklist_token(token: str, db: AsyncSession) -> None:
    """Add a token to the blacklist so it can no longer be used."""
    try:
        payload = jwt.decode(token, SECRET_KEY.get_secret_value(), algorithms=[ALGORITHM])
    except JWTError:
        return  # Token already expired or invalid — no need to blacklist

    exp_timestamp = payload.get("exp")
    if exp_timestamp is not None:
        expires_at = datetime.fromtimestamp(exp_timestamp, tz=UTC)
        await crud_token_blacklist.create(db, object=TokenBlacklistCreate(token=token, expires_at=expires_at))


async def blacklist_tokens(access_token: str, refresh_token: str, db: AsyncSession) -> None:
    """Blacklist both access and refresh tokens (used on logout)."""
    for token in [access_token, refresh_token]:
        if token:
            await blacklist_token(token, db)
