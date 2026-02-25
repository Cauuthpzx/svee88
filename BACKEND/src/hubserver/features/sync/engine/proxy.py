"""Upstream proxy — parallel fetch from all active agents.

Speed design:
- httpx.AsyncClient with connection pooling (keep-alive)
- asyncio.gather for parallel requests (latency = max, not sum)
- Each row tagged with _agent_name for the "Đại lý" column
"""

import asyncio
import logging

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from ..account.model import Agent

logger = logging.getLogger(__name__)

# Map frontend endpoint names → upstream URL paths
UPSTREAM_PATHS: dict[str, str] = {
    "members": "/agent/user.html",
    "invites": "/agent/inviteList.html",
    "bets": "/agent/bet.html",
    "bet-orders": "/agent/betOrder.html",
    "report-lottery": "/agent/reportLottery.html",
    "report-funds": "/agent/reportFunds.html",
    "report-third": "/agent/reportThirdGame.html",
    "deposits": "/agent/depositAndWithdrawal.html",
    "withdrawals": "/agent/withdrawalsRecord.html",
    "banks": "/agent/bankList.html",
}

_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"

# Default params per endpoint (required by upstream but not sent by frontend)
UPSTREAM_DEFAULTS: dict[str, dict] = {
    "bets": {"es": "1"},
    "bet-orders": {"es": "1"},
}

# Reusable client with connection pooling
_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=30.0,
            verify=True,
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            http2=True,
        )
    return _client


async def get_active_agents(db: AsyncSession, agent_id: int | None = None) -> list[Agent]:
    stmt = select(Agent).where(Agent.is_active.is_(True))
    if agent_id and agent_id > 0:
        stmt = stmt.where(Agent.id == agent_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def _fetch_one(
    client: httpx.AsyncClient,
    agent: Agent,
    upstream_path: str,
    form_data: dict,
) -> tuple[Agent, dict | None]:
    """Fetch from one upstream agent. Returns (agent, response_dict)."""
    headers = {
        "Cookie": agent.cookie or "",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": _UA,
        "Referer": agent.base_url + upstream_path,
        "Origin": agent.base_url,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    url = agent.base_url + upstream_path
    try:
        resp = await client.post(url, data=form_data, headers=headers)
        data = resp.json()
        return agent, data
    except Exception as e:
        logger.warning("Agent %s (%s) fetch failed: %s", agent.id, agent.owner, e)
        return agent, None


async def fetch_all_agents(
    db: AsyncSession,
    endpoint: str,
    form_params: dict,
    agent_id: int | None = None,
) -> dict:
    """Fan-out to all active agents in parallel, merge results."""
    upstream_path = UPSTREAM_PATHS.get(endpoint)
    if not upstream_path:
        return {"code": 1, "msg": f"Unknown endpoint: {endpoint}", "data": [], "count": 0}

    agents = await get_active_agents(db, agent_id)
    if not agents:
        return {"code": 0, "msg": "No active agents", "data": [], "count": 0}

    # Inject default params (e.g. es=1 for bet endpoints)
    defaults = UPSTREAM_DEFAULTS.get(endpoint, {})
    merged_params = {**defaults, **form_params}

    client = get_client()

    # Parallel fetch from all agents
    tasks = [_fetch_one(client, ag, upstream_path, merged_params) for ag in agents]
    results = await asyncio.gather(*tasks)

    all_data: list[dict] = []
    total_count = 0

    for agent, result in results:
        if result is None:
            continue
        if result.get("code") == 0 and isinstance(result.get("data"), list):
            for row in result["data"]:
                row["_agent_id"] = agent.id
                row["_agent_name"] = agent.owner
                row["_agent_base_url"] = agent.base_url
            all_data.extend(result["data"])
            total_count += result.get("count", len(result["data"]))

    return {"code": 0, "data": all_data, "count": total_count}
