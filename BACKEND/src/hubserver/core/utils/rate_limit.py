from __future__ import annotations

from datetime import UTC, datetime

from redis.asyncio import ConnectionPool, Redis

import structlog

from ...features.tier.schema import sanitize_path

logger = structlog.get_logger(__name__)


_RATE_LIMIT_LUA = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
"""


class RateLimiter:
    """Fixed-window rate limiter backed by Redis (Lua script for atomicity)."""

    _instance: RateLimiter | None = None
    pool: ConnectionPool | None = None
    client: Redis | None = None
    _script: object | None = None

    def __new__(cls) -> RateLimiter:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def initialize(cls, redis_url: str) -> None:
        """Create the Redis connection pool and register the Lua script."""
        instance = cls()
        if instance.pool is None:
            instance.pool = ConnectionPool.from_url(redis_url)
            instance.client = Redis(connection_pool=instance.pool)
            instance._script = instance.client.register_script(_RATE_LIMIT_LUA)

    @classmethod
    def get_client(cls) -> Redis:
        """Return the Redis client, raising if not yet initialized."""
        instance = cls()
        if instance.client is None:
            logger.error("Redis client is not initialized.")
            raise RuntimeError("Redis client is not initialized.")
        return instance.client

    async def is_rate_limited(self, user_id: int | str, path: str, limit: int, period: int) -> bool:
        """Return ``True`` if *user_id* has exceeded *limit* requests within *period* seconds."""
        if self._script is None:
            raise RuntimeError("RateLimiter not initialized.")

        current_timestamp = int(datetime.now(UTC).timestamp())
        window_start = current_timestamp - (current_timestamp % period)

        sanitized_path = sanitize_path(path)
        key = f"ratelimit:{user_id}:{sanitized_path}:{window_start}"

        try:
            current_count = await self._script(keys=[key], args=[period])
            return current_count > limit

        except Exception as e:
            logger.exception("Error checking rate limit for user %s on path %s: %s", user_id, path, e)
            raise


rate_limiter = RateLimiter()
