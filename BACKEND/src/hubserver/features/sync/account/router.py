"""Agent CRUD router — manage upstream agent accounts."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.config import APP_TZ
from ....core.db.database import async_get_db
from ....core.deps import get_current_superuser
from ....core.exceptions.http_exceptions import NotFoundException
from .model import Agent
from .schema import AgentCreate, AgentUpdate

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    dependencies=[Depends(get_current_superuser)],
)


def _serialize(agent: Agent) -> dict[str, Any]:
    """Serialize agent — cookie is NEVER exposed in API responses."""
    return {
        "id": agent.id,
        "owner": agent.owner,
        "username": agent.username,
        "base_url": agent.base_url,
        "cookie_set": bool(agent.cookie),
        "is_active": agent.is_active,
        "last_login_at": agent.last_login_at.isoformat() if agent.last_login_at else None,
        "created_at": agent.created_at.isoformat() if agent.created_at else None,
    }


async def _get_agent_or_404(db: AsyncSession, agent_id: int) -> Agent:
    """Fetch agent by ID or raise 404."""
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise NotFoundException(f"Agent {agent_id} not found")
    return agent


@router.get("")
async def list_agents(db: AsyncSession = Depends(async_get_db)) -> dict:
    """List all agents (active and inactive)."""
    result = await db.execute(select(Agent).order_by(Agent.id))
    agents = [_serialize(a) for a in result.scalars().all()]
    return {"code": 0, "message": "success", "data": {"agents": agents}, "errors": []}


@router.post("", status_code=201)
async def create_agent(body: AgentCreate, db: AsyncSession = Depends(async_get_db)) -> dict:
    """Create a new upstream agent."""
    agent = Agent(
        owner=body.owner,
        username=body.username,
        base_url=body.base_url.rstrip("/"),
        cookie=body.cookie,
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return {"code": 0, "message": "Agent created", "data": {"agent": _serialize(agent)}, "errors": []}


@router.patch("/{agent_id}")
async def update_agent(agent_id: int, body: AgentUpdate, db: AsyncSession = Depends(async_get_db)) -> dict:
    """Update an existing agent's fields."""
    values = {k: v for k, v in body.model_dump().items() if v is not None}
    if "base_url" in values:
        values["base_url"] = values["base_url"].rstrip("/")
    values["updated_at"] = datetime.now(APP_TZ)

    await db.execute(update(Agent).where(Agent.id == agent_id).values(**values))
    await db.commit()

    agent = await _get_agent_or_404(db, agent_id)
    return {"code": 0, "message": "Agent updated", "data": {"agent": _serialize(agent)}, "errors": []}


@router.delete("/{agent_id}")
async def delete_agent(agent_id: int, db: AsyncSession = Depends(async_get_db)) -> dict:
    """Soft-delete (deactivate) an agent."""
    await _get_agent_or_404(db, agent_id)
    await db.execute(update(Agent).where(Agent.id == agent_id).values(is_active=False))
    await db.commit()
    return {"code": 0, "message": "Agent deactivated", "data": None, "errors": []}
