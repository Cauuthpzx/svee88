"""Agent CRUD router — manage upstream agent accounts."""

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.config import APP_TZ
from ....core.db.database import async_get_db
from .model import Agent
from .schema import AgentCreate, AgentRead, AgentUpdate

router = APIRouter(prefix="/agents", tags=["agents"])


def _serialize(agent: Agent) -> dict:
    return {
        "id": agent.id,
        "owner": agent.owner,
        "username": agent.username,
        "base_url": agent.base_url,
        "is_active": agent.is_active,
        "last_login_at": agent.last_login_at.isoformat() if agent.last_login_at else None,
        "created_at": agent.created_at.isoformat() if agent.created_at else None,
    }


@router.get("")
async def list_agents(db: AsyncSession = Depends(async_get_db)) -> dict:
    result = await db.execute(select(Agent).order_by(Agent.id))
    agents = [_serialize(a) for a in result.scalars().all()]
    return {"agents": agents}


@router.post("")
async def create_agent(body: AgentCreate, db: AsyncSession = Depends(async_get_db)) -> dict:
    agent = Agent(
        owner=body.owner,
        username=body.username,
        base_url=body.base_url.rstrip("/"),
        cookie=body.cookie,
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return {"agent": _serialize(agent)}


@router.patch("/{agent_id}")
async def update_agent(agent_id: int, body: AgentUpdate, db: AsyncSession = Depends(async_get_db)) -> dict:
    values = {k: v for k, v in body.model_dump().items() if v is not None}
    if "base_url" in values:
        values["base_url"] = values["base_url"].rstrip("/")
    values["updated_at"] = datetime.now(APP_TZ)

    await db.execute(update(Agent).where(Agent.id == agent_id).values(**values))
    await db.commit()

    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        return {"error": "Agent not found"}
    return {"agent": _serialize(agent)}


@router.delete("/{agent_id}")
async def delete_agent(agent_id: int, db: AsyncSession = Depends(async_get_db)) -> dict:
    await db.execute(update(Agent).where(Agent.id == agent_id).values(is_active=False))
    await db.commit()
    return {"ok": True}
