import structlog
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

LOGGER = structlog.get_logger(__name__)


async def check_database_health(db: AsyncSession) -> bool:
    try:
        await db.execute(text("SELECT 1"))
        return True
    except Exception as e:
        LOGGER.exception("Database health check failed: %s", e)
        return False


async def check_redis_health(redis: Redis) -> bool:
    try:
        await redis.ping()
        return True
    except Exception as e:
        LOGGER.exception("Redis health check failed: %s", e)
        return False
