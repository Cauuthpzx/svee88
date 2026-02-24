from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.db.database import async_get_db
from ....core.utils.upsert import bulk_upsert
from ..schema import SyncRequest, SyncResponse
from ..service import update_sync_meta
from .model import BetLottery, BetOrder

router = APIRouter()


@router.post("/bet-orders", response_model=SyncResponse)
async def sync_bet_orders(body: SyncRequest, db: AsyncSession = Depends(async_get_db)):
    records = [{**r, "agent_id": body.agent_id} for r in body.data]
    count = await bulk_upsert(db, BetOrder, records, conflict_columns=["id", "bet_time"])
    last_date = await update_sync_meta(db, body.agent_id, "bet_order", count, records)
    await db.commit()
    return SyncResponse(processed=count, endpoint="bet_order", last_data_date=last_date)


@router.post("/bet-lottery", response_model=SyncResponse)
async def sync_bet_lottery(body: SyncRequest, db: AsyncSession = Depends(async_get_db)):
    records = [{**r, "agent_id": body.agent_id} for r in body.data]
    count = await bulk_upsert(db, BetLottery, records, conflict_columns=["id", "create_time"])
    last_date = await update_sync_meta(db, body.agent_id, "bet_lottery", count, records)
    await db.commit()
    return SyncResponse(processed=count, endpoint="bet_lottery", last_data_date=last_date)
