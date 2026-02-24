from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.db.database import async_get_db
from ....core.utils.upsert import bulk_upsert
from ..schema import SyncRequest, SyncResponse
from ..service import clean_member, update_sync_meta
from .model import Member

router = APIRouter()


@router.post("/members", response_model=SyncResponse)
async def sync_members(body: SyncRequest, db: AsyncSession = Depends(async_get_db)):
    records = [clean_member(r) | {"agent_id": body.agent_id} for r in body.data]
    count = await bulk_upsert(db, Member, records, conflict_columns=["id"])
    last_date = await update_sync_meta(db, body.agent_id, "members", count, records)
    await db.commit()
    return SyncResponse(processed=count, endpoint="members", last_data_date=last_date)
