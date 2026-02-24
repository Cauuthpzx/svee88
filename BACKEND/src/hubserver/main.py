from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .admin.initialize import create_admin_interface
from .features import create_api_router
from .core.config import settings
from .core.setup import create_application, lifespan_factory

admin = create_admin_interface()
router = create_api_router()


@asynccontextmanager
async def lifespan_with_admin(app: FastAPI) -> AsyncGenerator[None, None]:
    """Custom lifespan that includes admin initialization."""
    default_lifespan = lifespan_factory(settings)

    async with default_lifespan(app):
        if admin:
            await admin.initialize()

        yield


app = create_application(router=router, settings=settings, lifespan=lifespan_with_admin)

if admin:
    app.mount(settings.CRUD_ADMIN_MOUNT_PATH, admin.app)
