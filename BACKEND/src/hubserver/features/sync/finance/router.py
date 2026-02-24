from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.db.database import async_get_db
from ....core.utils.upsert import bulk_upsert
from ..schema import SyncRequest, SyncResponse
from ..service import update_sync_meta
from .model import DepositWithdrawal

router = APIRouter()


@router.post("/deposits", response_model=SyncResponse)
async def sync_deposits(body: SyncRequest, db: AsyncSession = Depends(async_get_db)):
    records = [{**r, "agent_id": body.agent_id} for r in body.data]
    count = await bulk_upsert(db, DepositWithdrawal, records, conflict_columns=["id", "create_time"])
    last_date = await update_sync_meta(db, body.agent_id, "deposit_withdrawal", count, records)
    await db.commit()
    return SyncResponse(processed=count, endpoint="deposit_withdrawal", last_data_date=last_date)
