"""Sync router — status, verify, config endpoints + sub-router aggregation."""

from typing import Any

from fastapi import APIRouter, Depends
from ...core.exceptions.http_exceptions import NotFoundException
from sqlalchemy.ext.asyncio.session import AsyncSession

from sqlalchemy import select

from ...core.db.database import async_get_db
from ...core.deps import get_current_user
from ...core.utils.upsert import bulk_upsert
from .account.model import Agent
from .account.router import router as account_router
from .bet.model import BetLottery, BetOrder
from .bet.router import router as bet_router
from .config.model import BankList, InviteList, LotteryGame, LotterySeries
from .crud import crud_sync_metadata
from .engine.router import router as engine_router
from .finance.model import DepositWithdrawal
from .finance.router import router as finance_router
from .member.model import Member
from .member.router import router as member_router
from .report.model import ReportFunds, ReportLottery, ReportThirdGame
from .report.router import router as report_router
from .schema import SyncConfigRequest, SyncResponse, SyncStatusResponse, VerifyRequest
from .service import fetch_records_by_ids

router = APIRouter(
    prefix="/sync",
    tags=["sync"],
    dependencies=[Depends(get_current_user)],
)

# --- Model map for verify endpoint ---
_MODEL_MAP: dict[str, type] = {
    "members": Member,
    "bet_order": BetOrder,
    "bet_lottery": BetLottery,
    "deposit_withdrawal": DepositWithdrawal,
    "report_lottery": ReportLottery,
    "report_funds": ReportFunds,
    "report_third_game": ReportThirdGame,
}


# --- Config endpoint ---
@router.post("/config", response_model=SyncResponse)
async def sync_config(
    body: SyncConfigRequest,
    db: AsyncSession = Depends(async_get_db),
):
    """Sync reference/config data: lottery_series, lottery_games, invite_list, bank_list."""
    agent_id = body.agent_id
    total = 0

    if body.lottery_series:
        records = [{**r, "agent_id": agent_id} for r in body.lottery_series]
        total += await bulk_upsert(db, LotterySeries, records, conflict_columns=["id"])

    if body.lottery_games:
        records = [{**r, "agent_id": agent_id} for r in body.lottery_games]
        total += await bulk_upsert(db, LotteryGame, records, conflict_columns=["id"])

    if body.invite_list:
        records = [{**r, "agent_id": agent_id} for r in body.invite_list]
        total += await bulk_upsert(db, InviteList, records, conflict_columns=["id"])

    if body.bank_list:
        records = [{**r, "agent_id": agent_id} for r in body.bank_list]
        total += await bulk_upsert(db, BankList, records, conflict_columns=["id"])

    await db.commit()
    return SyncResponse(processed=total, endpoint="config")


# --- Verify endpoint ---
@router.post("/verify/{endpoint}")
async def verify_records(
    endpoint: str,
    body: VerifyRequest,
    db: AsyncSession = Depends(async_get_db),
):
    """Return DB records matching given IDs for verification against upstream data."""
    model = _MODEL_MAP.get(endpoint)
    if not model:
        raise NotFoundException(f"Endpoint '{endpoint}' not found")

    records = await fetch_records_by_ids(db, model, body.ids)
    return {"records": records, "count": len(records), "requested": len(body.ids)}


# --- Agent options (lightweight, any authenticated user) ---
@router.get("/agent-options")
async def agent_options(db: AsyncSession = Depends(async_get_db)) -> dict:
    """Return active agents (id + owner) for dropdown filters."""
    result = await db.execute(
        select(Agent.id, Agent.owner)
        .where(Agent.is_active.is_(True))
        .order_by(Agent.id)
    )
    return {"agents": [{"id": row.id, "owner": row.owner} for row in result.all()]}


# --- Status endpoint ---
@router.get("/status", response_model=SyncStatusResponse)
async def get_sync_status(db: AsyncSession = Depends(async_get_db)):
    """Get sync status for all endpoints, including last_data_date."""
    result = await crud_sync_metadata.get_multi(db=db, offset=0, limit=50)
    endpoints = []
    if result and "data" in result:
        for item in result["data"]:
            endpoints.append({
                "endpoint": item.endpoint,
                "agent_id": item.agent_id,
                "last_sync_at": item.last_sync_at.isoformat() if item.last_sync_at else None,
                "last_sync_count": item.last_sync_count,
                "sync_status": item.sync_status,
                "error_message": item.error_message,
                "sync_params": item.sync_params,
            })
    return SyncStatusResponse(endpoints=endpoints)


# --- Include sub-routers ---
router.include_router(member_router)
router.include_router(bet_router)
router.include_router(finance_router)
router.include_router(report_router)
router.include_router(account_router)
router.include_router(engine_router)
