"""3-layer SWR cache: Memory → Redis → Upstream.

Layer 1: In-process memory (OrderedDict, LRU, <1ms)
Layer 2: Redis (existing pool from core/utils/cache, ~3ms)
Layer 3: Upstream HTTP fetch via proxy.py (~200ms)

Stale-While-Revalidate: returns stale data instantly,
frontend triggers ?_fresh=1 reload for fresh data.
"""

import hashlib
import json
import logging
import time
from collections import OrderedDict
from dataclasses import dataclass

from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.utils import cache as redis_cache
from .proxy import fetch_all_agents

logger = logging.getLogger(__name__)

# ── Tuning constants ──
MEMORY_FRESH_TTL = 300      # seconds — data considered "fresh" (5 min)
MEMORY_MAX_STALE_TTL = 3600 # seconds — evict after this (1 hour)
MEMORY_MAX_ENTRIES = 500
REDIS_TTL = 1800            # seconds — 30 minutes


# ── Cache key ──
def make_cache_key(endpoint: str, agent_id: int | None, params: dict) -> str:
    sorted_pairs = sorted(params.items())
    raw = f"{endpoint}|{agent_id or 0}|{sorted_pairs}"
    digest = hashlib.md5(raw.encode(), usedforsecurity=False).hexdigest()
    return f"sync:proxy:{digest}"


# ── Layer 1: Memory cache ──
@dataclass(slots=True)
class CacheEntry:
    data: dict
    created_at: float
    hit_count: int = 0


class MemoryCache:
    """LRU-bounded in-process cache with fresh/stale distinction."""

    def __init__(
        self,
        fresh_ttl: float = MEMORY_FRESH_TTL,
        max_stale_ttl: float = MEMORY_MAX_STALE_TTL,
        max_entries: int = MEMORY_MAX_ENTRIES,
    ):
        self._store: OrderedDict[str, CacheEntry] = OrderedDict()
        self._fresh_ttl = fresh_ttl
        self._max_stale_ttl = max_stale_ttl
        self._max_entries = max_entries

    def get(self, key: str) -> tuple[dict | None, bool]:
        """Returns (data, is_fresh). (None, False) on miss."""
        entry = self._store.get(key)
        if entry is None:
            return None, False

        age = time.monotonic() - entry.created_at
        if age > self._max_stale_ttl:
            del self._store[key]
            return None, False

        self._store.move_to_end(key)
        entry.hit_count += 1
        return entry.data, age < self._fresh_ttl

    def get_age(self, key: str) -> float:
        entry = self._store.get(key)
        return round(time.monotonic() - entry.created_at, 1) if entry else 0

    def put(self, key: str, data: dict) -> None:
        if key in self._store:
            del self._store[key]
        self._store[key] = CacheEntry(data=data, created_at=time.monotonic())
        self._evict()

    def _evict(self) -> None:
        while len(self._store) > self._max_entries:
            self._store.popitem(last=False)

    def clear(self) -> None:
        self._store.clear()

    def stats(self) -> dict:
        return {"entries": len(self._store), "max": self._max_entries}


# Module singleton
_memory = MemoryCache()


# ── Layer 2: Redis helpers ──
async def _redis_get(key: str) -> dict | None:
    if redis_cache.client is None:
        return None
    try:
        raw = await redis_cache.client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception:
        logger.warning("Redis GET failed: %s", key, exc_info=True)
        return None


async def _redis_put(key: str, data: dict) -> None:
    if redis_cache.client is None:
        return
    try:
        serialized = json.dumps(data, ensure_ascii=False, default=str)
        await redis_cache.client.set(key, serialized, ex=REDIS_TTL)
    except Exception:
        logger.warning("Redis SET failed: %s", key, exc_info=True)


# ── SWR orchestrator ──
async def swr_fetch(
    db: AsyncSession,
    endpoint: str,
    form_params: dict,
    agent_id: int | None = None,
    force_fresh: bool = False,
) -> dict:
    """3-layer SWR cache. Returns response with _cache_status metadata."""
    key = make_cache_key(endpoint, agent_id, form_params)

    # Force fresh — bypass all caches
    if force_fresh:
        result = await fetch_all_agents(db, endpoint, form_params, agent_id)
        if result.get("code") == 0 and result.get("data"):
            _memory.put(key, {**result})
            await _redis_put(key, {**result})
        result["_cache_status"] = "miss"
        result["_cache_age"] = 0
        return result

    # Layer 1: Memory
    data, is_fresh = _memory.get(key)
    if data is not None:
        response = {**data}
        response["_cache_status"] = "fresh" if is_fresh else "stale"
        response["_cache_age"] = _memory.get_age(key)
        return response

    # Layer 2: Redis
    data = await _redis_get(key)
    if data is not None:
        _memory.put(key, data)
        response = {**data}
        response["_cache_status"] = "stale"
        response["_cache_age"] = 30
        return response

    # Layer 3: Upstream fetch
    result = await fetch_all_agents(db, endpoint, form_params, agent_id)
    if result.get("code") == 0 and result.get("data"):
        _memory.put(key, {**result})
        await _redis_put(key, {**result})

    result["_cache_status"] = "miss"
    result["_cache_age"] = 0
    return result


def get_cache_stats() -> dict:
    return _memory.stats()
