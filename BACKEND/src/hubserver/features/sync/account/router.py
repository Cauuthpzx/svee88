"""Agent CRUD router — quản lý tài khoản upstream agent."""

import asyncio
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.config import APP_TZ
from ....core.db.database import async_get_db
from ....core.deps import get_current_superuser
from ....core.exceptions.http_exceptions import NotFoundException
from .login_service import (
    AgentLoginService,
    cookie_dict_to_str,
    decrypt_password,
    encrypt_password,
)
from .model import Agent
from .schema import AgentCreate, AgentUpdate

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    dependencies=[Depends(get_current_superuser)],
)


def _serialize(agent: Agent) -> dict[str, Any]:
    """Serialize agent — cookie và password_enc KHÔNG bao giờ lộ ra ngoài."""
    return {
        "id": agent.id,
        "owner": agent.owner,
        "username": agent.username,
        "base_url": agent.base_url,
        "cookie_set": bool(agent.cookie),
        "password_set": bool(agent.password_enc),
        "is_active": agent.is_active,
        "last_login_at": agent.last_login_at.isoformat() if agent.last_login_at else None,
        "created_at": agent.created_at.isoformat() if agent.created_at else None,
    }


async def _get_agent_or_404(db: AsyncSession, agent_id: int) -> Agent:
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise NotFoundException(f"Agent {agent_id} not found")
    return agent


@router.get("")
async def list_agents(db: AsyncSession = Depends(async_get_db)) -> dict:
    result = await db.execute(select(Agent).order_by(Agent.id))
    agents = [_serialize(a) for a in result.scalars().all()]
    return {"code": 0, "message": "success", "data": {"agents": agents}, "errors": []}


@router.post("", status_code=201)
async def create_agent(body: AgentCreate, db: AsyncSession = Depends(async_get_db)) -> dict:
    agent = Agent(
        owner=body.owner,
        username=body.username,
        base_url=body.base_url.rstrip("/"),
        cookie=body.cookie,
        password_enc=encrypt_password(body.password) if body.password else None,
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return {"code": 0, "message": "Agent created", "data": {"agent": _serialize(agent)}, "errors": []}


@router.patch("/{agent_id}")
async def update_agent(agent_id: int, body: AgentUpdate, db: AsyncSession = Depends(async_get_db)) -> dict:
    values: dict[str, Any] = {k: v for k, v in body.model_dump().items() if v is not None and k != "password"}
    if "base_url" in values:
        values["base_url"] = values["base_url"].rstrip("/")
    if body.password:
        values["password_enc"] = encrypt_password(body.password)
    values["updated_at"] = datetime.now(APP_TZ)

    await db.execute(update(Agent).where(Agent.id == agent_id).values(**values))
    await db.commit()

    agent = await _get_agent_or_404(db, agent_id)
    return {"code": 0, "message": "Agent updated", "data": {"agent": _serialize(agent)}, "errors": []}


@router.delete("/{agent_id}")
async def delete_agent(agent_id: int, db: AsyncSession = Depends(async_get_db)) -> dict:
    await _get_agent_or_404(db, agent_id)
    await db.execute(update(Agent).where(Agent.id == agent_id).values(is_active=False))
    await db.commit()
    return {"code": 0, "message": "Agent deactivated", "data": None, "errors": []}


@router.post("/{agent_id}/login")
async def login_agent(agent_id: int, db: AsyncSession = Depends(async_get_db)) -> dict:
    """Trigger đăng nhập thủ công cho agent — lấy cookie mới từ upstream."""
    agent = await _get_agent_or_404(db, agent_id)

    if not agent.password_enc:
        return {"code": 1, "message": "Agent chưa có mật khẩu. Cập nhật password trước.", "data": None, "errors": []}

    plain_pw = decrypt_password(agent.password_enc)
    svc = AgentLoginService(agent.base_url)

    try:
        ok, msg, cookies_dict = await asyncio.to_thread(svc.login, agent.username, plain_pw)
    finally:
        svc.close()

    if not ok:
        return {"code": 1, "message": msg, "data": None, "errors": []}

    new_cookie = cookie_dict_to_str(cookies_dict)
    now = datetime.now(APP_TZ)
    await db.execute(
        update(Agent).where(Agent.id == agent_id).values(cookie=new_cookie, last_login_at=now)
    )
    await db.commit()

    return {"code": 0, "message": "Đăng nhập thành công", "data": {"cookie_set": True, "last_login_at": now.isoformat()}, "errors": []}
