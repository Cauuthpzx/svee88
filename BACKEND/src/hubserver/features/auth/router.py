from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm  # noqa: used by login endpoint
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import settings
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import UnauthorizedException
from ...core.schemas import Token
from ...core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    TokenType,
    authenticate_user,
    blacklist_token,
    blacklist_tokens,
    create_access_token,
    create_refresh_token,
    verify_token,
)

router = APIRouter(tags=["login"])


@router.post("/login", response_model=Token)
async def login_for_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict[str, str]:
    user = await authenticate_user(username_or_email=form_data.username, password=form_data.password, db=db)
    if not user:
        raise UnauthorizedException("Wrong username, email or password.")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user["username"]}, expires_delta=access_token_expires)

    refresh_token = create_refresh_token(data={"sub": user["username"]})
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax", max_age=max_age
    )
    # HttpOnly access_token cookie — JS cannot read, browser auto-sends
    response.set_cookie(
        key="access_token", value=access_token, httponly=True, secure=True, samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    # Non-HttpOnly flag for frontend guard checks (contains no secret)
    response.set_cookie(key="logged_in", value="1", samesite="lax", max_age=max_age)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh")
async def refresh_access_token(
    request: Request, response: Response, db: AsyncSession = Depends(async_get_db)
) -> dict[str, str]:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise UnauthorizedException("Missing refresh token.")

    user_data = await verify_token(refresh_token, TokenType.REFRESH, db)
    if not user_data:
        raise UnauthorizedException("Invalid refresh token.")

    # Blacklist old refresh token to prevent reuse
    await blacklist_token(refresh_token, db)

    new_access_token = create_access_token(data={"sub": user_data.username_or_email})

    # Rotate: issue new refresh token
    new_refresh_token = create_refresh_token(data={"sub": user_data.username_or_email})
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    response.set_cookie(
        key="refresh_token", value=new_refresh_token, httponly=True, secure=True, samesite="lax", max_age=max_age
    )
    # Rotate access_token cookie
    response.set_cookie(
        key="access_token", value=new_access_token, httponly=True, secure=True, samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(None, alias="refresh_token"),
    db: AsyncSession = Depends(async_get_db),
) -> dict[str, str]:
    if not refresh_token:
        raise UnauthorizedException("Refresh token not found.")

    # Extract access token from HttpOnly cookie or Authorization header
    access_token = request.cookies.get("access_token")
    if not access_token:
        auth_header = request.headers.get("Authorization", "")
        _, _, access_token = auth_header.partition(" ")

    if access_token:
        await blacklist_tokens(access_token=access_token, refresh_token=refresh_token, db=db)
    else:
        await blacklist_token(refresh_token, db)

    response.delete_cookie(key="refresh_token")
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="logged_in")

    return {"message": "Logged out successfully."}
