import asyncio
import time
from collections.abc import AsyncGenerator, Callable
from contextlib import _AsyncGeneratorContextManager, asynccontextmanager
from typing import Any

import anyio
import fastapi
import redis.asyncio as redis
import structlog
from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

from ..middleware.client_cache import ClientCacheMiddleware
from ..middleware.logger import LoggerMiddleware
from .config import (
    AppSettings,
    ClientSideCacheSettings,
    CORSSettings,
    DatabaseSettings,
    EnvironmentOption,
    EnvironmentSettings,
    FirstUserSettings,
    RedisCacheSettings,
    RedisRateLimiterSettings,
    settings,
)
from .db.database import Base
from .db.database import async_engine as engine
from .exceptions import register_exception_handlers
from .utils import cache
from .utils.rate_limit import rate_limiter

logger = structlog.get_logger()


# -------------- database --------------
async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# -------------- cache --------------
async def create_redis_cache_pool() -> None:
    cache.pool = redis.ConnectionPool.from_url(settings.REDIS_CACHE_URL)
    cache.client = redis.Redis.from_pool(cache.pool)  # type: ignore


async def close_redis_cache_pool() -> None:
    if cache.client is not None:
        await cache.client.aclose()  # type: ignore


# -------------- rate limit --------------
async def create_redis_rate_limit_pool() -> None:
    rate_limiter.initialize(settings.REDIS_RATE_LIMIT_URL)  # type: ignore


async def close_redis_rate_limit_pool() -> None:
    if rate_limiter.client is not None:
        await rate_limiter.client.aclose()  # type: ignore


# -------------- token blacklist cleanup --------------
async def cleanup_expired_tokens() -> None:
    """Delete expired token blacklist entries on startup."""
    from datetime import UTC, datetime

    from sqlalchemy import delete

    from .db.database import local_session
    from .db.token_blacklist import TokenBlacklist

    try:
        async with local_session() as session:
            result = await session.execute(
                delete(TokenBlacklist).where(TokenBlacklist.expires_at < datetime.now(UTC))
            )
            await session.commit()
            if result.rowcount:
                logger.info("Cleaned up %d expired blacklisted tokens", result.rowcount)
    except Exception:
        logger.warning("Failed to clean up expired tokens", exc_info=True)


# -------------- application --------------
async def set_threadpool_tokens(number_of_tokens: int = 100) -> None:
    limiter = anyio.to_thread.current_default_thread_limiter()
    limiter.total_tokens = number_of_tokens


def lifespan_factory(
    settings: (
        DatabaseSettings
        | RedisCacheSettings
        | AppSettings
        | ClientSideCacheSettings
        | CORSSettings
        | RedisRateLimiterSettings
        | EnvironmentSettings
    ),
    create_tables_on_start: bool = True,
) -> Callable[[FastAPI], _AsyncGeneratorContextManager[Any]]:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator:
        from asyncio import Event

        initialization_complete = Event()
        app.state.initialization_complete = initialization_complete

        await set_threadpool_tokens()

        try:
            if isinstance(settings, RedisCacheSettings):
                await create_redis_cache_pool()

            if isinstance(settings, RedisRateLimiterSettings):
                await create_redis_rate_limit_pool()

            if create_tables_on_start:
                await create_tables()

            await cleanup_expired_tokens()

            initialization_complete.set()

            yield

        finally:
            shutdown_start = time.monotonic()
            deadline = 3.0
            logger.info("🔻 Shutting down... (%.0fs timeout)", deadline)

            async def _close_resource(name: str, coro: Any) -> None:
                elapsed = time.monotonic() - shutdown_start
                remaining = deadline - elapsed
                logger.info("  ├─ closing %s... (%.1fs left)", name, max(remaining, 0))
                await coro
                logger.info("  │  └─ %s closed ✓", name)

            try:
                async with asyncio.timeout(deadline):
                    try:
                        from ..features.sync.engine.proxy import close_httpx_client
                        await _close_resource("httpx proxy client", close_httpx_client())
                    except Exception:
                        logger.warning("  ╳ Failed to close httpx client", exc_info=True)

                    if isinstance(settings, RedisCacheSettings):
                        try:
                            await _close_resource("Redis cache", close_redis_cache_pool())
                        except Exception:
                            logger.warning("  ╳ Failed to close Redis cache", exc_info=True)

                    if isinstance(settings, RedisRateLimiterSettings):
                        try:
                            await _close_resource("Redis rate-limiter", close_redis_rate_limit_pool())
                        except Exception:
                            logger.warning("  ╳ Failed to close Redis rate-limiter", exc_info=True)

                    try:
                        await _close_resource("Database engine", engine.dispose())
                    except Exception:
                        logger.warning("  ╳ Failed to close database engine", exc_info=True)

            except TimeoutError:
                elapsed = time.monotonic() - shutdown_start
                logger.warning("  ╳ Cleanup timed out after %.1fs — forcing exit", elapsed)

            total = time.monotonic() - shutdown_start
            logger.info("🔻 Shutdown complete in %.2fs", total)

    return lifespan


def create_application(
    router: APIRouter,
    settings: (
        DatabaseSettings
        | RedisCacheSettings
        | AppSettings
        | ClientSideCacheSettings
        | CORSSettings
        | RedisRateLimiterSettings
        | EnvironmentSettings
    ),
    create_tables_on_start: bool = True,
    lifespan: Callable[[FastAPI], _AsyncGeneratorContextManager[Any]] | None = None,
    **kwargs: Any,
) -> FastAPI:
    if isinstance(settings, AppSettings):
        to_update = {
            "title": settings.APP_NAME,
            "description": settings.APP_DESCRIPTION,
            "contact": {"name": settings.CONTACT_NAME, "email": settings.CONTACT_EMAIL},
            "license_info": {"name": settings.LICENSE_NAME},
        }
        kwargs.update(to_update)

    if isinstance(settings, EnvironmentSettings):
        kwargs.update({"docs_url": None, "redoc_url": None, "openapi_url": None})

    if isinstance(settings, FirstUserSettings) and isinstance(settings, EnvironmentSettings):
        settings.check_admin_password_strength(settings.ENVIRONMENT.value)

    if lifespan is None:
        lifespan = lifespan_factory(settings, create_tables_on_start=create_tables_on_start)

    application = FastAPI(lifespan=lifespan, **kwargs)
    register_exception_handlers(application)
    application.include_router(router)

    if isinstance(settings, ClientSideCacheSettings):
        application.add_middleware(ClientCacheMiddleware, max_age=settings.CLIENT_CACHE_MAX_AGE)

    if isinstance(settings, CORSSettings):
        if isinstance(settings, EnvironmentSettings):
            if settings.CORS_ORIGINS == ["*"] and settings.ENVIRONMENT == EnvironmentOption.PRODUCTION:
                raise ValueError(
                    "CORS_ORIGINS=['*'] with allow_credentials=True in production is a security risk. "
                    "Set CORS_ORIGINS to specific allowed domains via environment variable."
                )
        application.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=settings.CORS_METHODS,
            allow_headers=settings.CORS_HEADERS,
        )
    application.add_middleware(LoggerMiddleware)
    if isinstance(settings, EnvironmentSettings):
        if settings.ENVIRONMENT != EnvironmentOption.PRODUCTION:
            docs_router = APIRouter()
            if settings.ENVIRONMENT != EnvironmentOption.LOCAL:
                from .deps import get_current_superuser  # lazy import

                docs_router = APIRouter(dependencies=[Depends(get_current_superuser)])

            @docs_router.get("/docs", include_in_schema=False)
            async def get_swagger_documentation() -> fastapi.responses.HTMLResponse:
                return get_swagger_ui_html(openapi_url="/openapi.json", title="docs")

            @docs_router.get("/redoc", include_in_schema=False)
            async def get_redoc_documentation() -> fastapi.responses.HTMLResponse:
                return get_redoc_html(openapi_url="/openapi.json", title="docs")

            @docs_router.get("/openapi.json", include_in_schema=False)
            async def openapi() -> dict[str, Any]:
                out: dict = get_openapi(title=application.title, version=application.version, routes=application.routes)
                return out

            application.include_router(docs_router)

    return application
