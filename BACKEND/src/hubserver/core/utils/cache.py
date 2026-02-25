from collections.abc import AsyncGenerator

from redis.asyncio import ConnectionPool, Redis

pool: ConnectionPool | None = None
client: Redis | None = None


async def async_get_redis() -> AsyncGenerator[Redis, None]:
    """Get a Redis client from the pool for each request."""
    client = Redis(connection_pool=pool)
    try:
        yield client
    finally:
        await client.aclose()  # type: ignore
