from fastapi import APIRouter


def create_api_router() -> APIRouter:
    """Build the aggregated API router. Called lazily to avoid circular imports."""
    from .auth.router import router as auth_router
    from .data.router import router as data_router
    from .health.router import router as health_router
    from .sync.router import router as sync_router
    from .tier.router import router as tier_router
    from .user.router import router as user_router

    api_router = APIRouter(prefix="/api/v1")
    api_router.include_router(health_router)
    api_router.include_router(auth_router)
    api_router.include_router(user_router)
    api_router.include_router(tier_router)
    api_router.include_router(sync_router)
    api_router.include_router(data_router)
    return api_router
