"""FastAPI dependencies — authentication, authorization, and rate limiting."""

from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db.database import async_get_db
from .exceptions.http_exceptions import ForbiddenException, RateLimitException, UnauthorizedException
import structlog

from .security import TokenType, lookup_user, verify_token
from .utils.rate_limit import rate_limiter

logger = structlog.get_logger(__name__)

DEFAULT_LIMIT = settings.DEFAULT_RATE_LIMIT_LIMIT
DEFAULT_PERIOD = settings.DEFAULT_RATE_LIMIT_PERIOD


def _extract_token(request: Request) -> str | None:
    """Extract access token from HttpOnly cookie or Authorization header (fallback)."""
    # 1. HttpOnly cookie (preferred — immune to XSS)
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    # 2. Authorization header (fallback for API clients / Layui table)
    auth_header = request.headers.get("Authorization")
    if auth_header:
        scheme, _, token = auth_header.partition(" ")
        if scheme.lower() == "bearer" and token:
            return token
    return None


async def get_current_user(
    request: Request, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> dict[str, Any]:
    """Return the authenticated user dict, or raise 401."""
    token = _extract_token(request)
    if not token:
        raise UnauthorizedException("User is not authenticated.")

    token_data = await verify_token(token, TokenType.ACCESS, db)
    if token_data is None:
        raise UnauthorizedException("User is not authenticated.")

    user = await lookup_user(db, token_data.username_or_email)
    if user:
        return user

    raise UnauthorizedException("User is not authenticated.")


async def get_optional_user(
    request: Request, db: AsyncSession = Depends(async_get_db)
) -> dict[str, Any] | None:
    """Return the authenticated user dict if a valid token is present, else ``None``."""
    token = _extract_token(request)
    if not token:
        return None

    try:
        token_data = await verify_token(token, TokenType.ACCESS, db)
        if token_data is None:
            return None

        return await lookup_user(db, token_data.username_or_email)

    except HTTPException as http_exc:
        if http_exc.status_code != 401:
            logger.error("Unexpected HTTPException in get_optional_user: %s", http_exc.detail)
        return None

    except Exception as exc:
        logger.error("Unexpected error in get_optional_user: %s", exc)
        return None


async def get_current_superuser(current_user: Annotated[dict, Depends(get_current_user)]) -> dict:
    """Return the current user if superuser, else raise 403."""
    if not current_user["is_superuser"]:
        raise ForbiddenException("You do not have enough privileges.")

    return current_user


async def rate_limiter_dependency(
    request: Request,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    user: dict | None = Depends(get_optional_user),
) -> None:
    """Check per-user or per-IP rate limits before processing the request."""
    from ..features.tier.crud import crud_rate_limits, crud_tiers  # lazy import
    from ..features.tier.schema import RateLimitRead, TierRead, sanitize_path  # lazy import

    if hasattr(request.app.state, "initialization_complete"):
        await request.app.state.initialization_complete.wait()

    path = sanitize_path(request.url.path)
    if user:
        user_id: int | str = user["id"]
        tier = await crud_tiers.get(db, id=user["tier_id"], schema_to_select=TierRead)
        if tier:
            rate_limit = await crud_rate_limits.get(
                db=db, tier_id=tier["id"], path=path, schema_to_select=RateLimitRead
            )
            if rate_limit:
                limit, period = rate_limit["limit"], rate_limit["period"]
            else:
                logger.warning(
                    "User %s with tier '%s' has no specific rate limit for path '%s'. Applying default rate limit.",
                    user_id, tier['name'], path
                )
                limit, period = DEFAULT_LIMIT, DEFAULT_PERIOD
        else:
            logger.warning("User %s has no assigned tier. Applying default rate limit.", user_id)
            limit, period = DEFAULT_LIMIT, DEFAULT_PERIOD
    else:
        user_id = request.client.host if request.client else "unknown"
        limit, period = DEFAULT_LIMIT, DEFAULT_PERIOD

    is_limited = await rate_limiter.is_rate_limited(user_id=user_id, path=path, limit=limit, period=period)
    if is_limited:
        raise RateLimitException("Rate limit exceeded.")
