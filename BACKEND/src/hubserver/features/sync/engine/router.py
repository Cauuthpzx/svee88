"""Upstream proxy router — forward requests to agents in parallel."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.db.database import async_get_db
from .proxy import fetch_all_agents

router = APIRouter(prefix="/proxy", tags=["proxy"])


@router.post("/{endpoint}")
async def proxy_upstream(
    endpoint: str,
    request: Request,
    db: AsyncSession = Depends(async_get_db),
) -> dict:
    """Proxy request to all active upstream agents, merge results.

    Accepts same form params as upstream (page, limit, username, date, etc.)
    plus optional agent_id to filter to a specific agent.
    """
    body = await request.body()
    # Parse URL-encoded form data
    from urllib.parse import parse_qs
    parsed = parse_qs(body.decode("utf-8"))
    form_params = {k: v[0] for k, v in parsed.items()}

    # Extract optional agent_id filter
    agent_id = None
    raw = form_params.pop("agent_id", None)
    if raw and raw != "0":
        agent_id = int(raw)

    return await fetch_all_agents(db, endpoint, form_params, agent_id)
