from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.db.database import async_get_db
from ....core.utils.upsert import bulk_upsert
from ..schema import SyncRequest, SyncResponse
from ..service import rename_report_funds, update_sync_meta
from .model import ReportFunds, ReportLottery, ReportThirdGame

router = APIRouter()


@router.post("/reports/lottery", response_model=SyncResponse)
async def sync_report_lottery(body: SyncRequest, db: AsyncSession = Depends(async_get_db)):
    records = [{**r, "agent_id": body.agent_id} for r in body.data]
    count = await bulk_upsert(
        db, ReportLottery, records,
        conflict_columns=["agent_id", "report_date", "uid", "lottery_id"],
    )
    last_date = await update_sync_meta(db, body.agent_id, "report_lottery", count, records)
    await db.commit()
    return SyncResponse(processed=count, endpoint="report_lottery", last_data_date=last_date)


@router.post("/reports/funds", response_model=SyncResponse)
async def sync_report_funds(body: SyncRequest, db: AsyncSession = Depends(async_get_db)):
    records = [rename_report_funds(r) | {"agent_id": body.agent_id} for r in body.data]
    count = await bulk_upsert(db, ReportFunds, records, conflict_columns=["agent_id", "id"])
    last_date = await update_sync_meta(db, body.agent_id, "report_funds", count, records)
    await db.commit()
    return SyncResponse(processed=count, endpoint="report_funds", last_data_date=last_date)


@router.post("/reports/third-game", response_model=SyncResponse)
async def sync_report_third_game(body: SyncRequest, db: AsyncSession = Depends(async_get_db)):
    records = [{**r, "agent_id": body.agent_id} for r in body.data]
    count = await bulk_upsert(
        db, ReportThirdGame, records,
        conflict_columns=["agent_id", "report_date", "uid", "platform_id"],
    )
    last_date = await update_sync_meta(db, body.agent_id, "report_third_game", count, records)
    await db.commit()
    return SyncResponse(processed=count, endpoint="report_third_game", last_data_date=last_date)
