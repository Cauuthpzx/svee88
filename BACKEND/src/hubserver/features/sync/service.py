"""Sync service helpers — shared logic for sync endpoints."""

from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from ...core.config import APP_TZ
from .crud import crud_sync_metadata


# Date field per endpoint (for tracking last synced data date)
DATE_FIELDS: dict[str, str] = {
    "members": "update_time",
    "bet_order": "bet_time",
    "bet_lottery": "create_time",
    "deposit_withdrawal": "create_time",
    "report_lottery": "report_date",
    "report_funds": "report_date",
    "report_third_game": "report_date",
}


async def update_sync_meta(
    db: AsyncSession,
    agent_id: int,
    endpoint: str,
    count: int,
    records: list[dict] | None = None,
    status: str = "completed",
) -> str | None:
    """Update sync metadata. Returns last_data_date if detected."""
    now = datetime.now(APP_TZ)
    last_data_date = None

    sync_params: dict[str, Any] = {}
    date_field = DATE_FIELDS.get(endpoint)
    if date_field and records:
        dates = []
        for r in records:
            val = r.get(date_field)
            if val:
                dates.append(str(val)[:10])
        if dates:
            last_data_date = max(dates)
            sync_params = {
                "last_data_date": last_data_date,
                "first_data_date": min(dates),
                "date_field": date_field,
                "record_count": count,
            }

    meta = await crud_sync_metadata.get(db=db, agent_id=agent_id, endpoint=endpoint)
    if meta:
        update_data: dict[str, Any] = {
            "last_sync_at": now,
            "last_sync_count": count,
            "sync_status": status,
            "updated_at": now,
        }
        if sync_params:
            existing = meta.sync_params or {}
            existing.update(sync_params)
            update_data["sync_params"] = existing
        await crud_sync_metadata.update(
            db=db, object=update_data, agent_id=agent_id, endpoint=endpoint,
        )
    else:
        await crud_sync_metadata.create(
            db=db,
            object={
                "agent_id": agent_id,
                "endpoint": endpoint,
                "last_sync_at": now,
                "last_sync_count": count,
                "sync_status": status,
                "sync_params": sync_params or None,
            },
        )
    return last_data_date


async def fetch_records_by_ids(db: AsyncSession, model: type, ids: list[int]) -> list[dict]:
    """Fetch DB records by IDs and serialize to JSON-safe dicts."""
    table = model.__table__
    stmt = select(table).where(table.c.id.in_(ids))
    result = await db.execute(stmt)
    rows = result.mappings().all()

    records = []
    for row in rows:
        r: dict[str, Any] = {}
        for k, v in row.items():
            if isinstance(v, datetime):
                r[k] = v.isoformat()
            elif isinstance(v, Decimal):
                r[k] = str(v)
            else:
                r[k] = v
        records.append(r)
    return records


# --- Member field cleaning & mapping ---

_SENSITIVE_FIELDS = {"password", "fund_password", "salt"}

# Upstream returns formatted fields → map to model columns
_STATUS_MAP = {
    "Chưa đánh giá": 0, "Bình thường": 1, "Đóng băng": 2, "Khoá": 3,
}
_TYPE_MAP = {
    "Hội viên chính thức": 1, "Hội viên dùng thử": 0, "Đại lý": 2, "Tổng đại lý": 3,
}


def clean_member(record: dict) -> dict:
    """Map upstream formatted fields to model columns, strip sensitive data."""
    r = {k: v for k, v in record.items() if k not in _SENSITIVE_FIELDS}

    # deposit_count/amount → deposit_times/money
    if "deposit_count" in r and "deposit_times" not in r:
        r["deposit_times"] = r.pop("deposit_count")
    else:
        r.pop("deposit_count", None)
    if "deposit_amount" in r and "deposit_money" not in r:
        r["deposit_money"] = r.pop("deposit_amount")
    else:
        r.pop("deposit_amount", None)

    # withdrawal_count/amount → withdrawal_times/money
    if "withdrawal_count" in r and "withdrawal_times" not in r:
        r["withdrawal_times"] = r.pop("withdrawal_count")
    else:
        r.pop("withdrawal_count", None)
    if "withdrawal_amount" in r and "withdrawal_money" not in r:
        r["withdrawal_money"] = r.pop("withdrawal_amount")
    else:
        r.pop("withdrawal_amount", None)

    # parent_user (username string) → user_parent (int)
    if "parent_user" in r and "user_parent" not in r:
        try:
            r["user_parent"] = int(r.pop("parent_user"))
        except (ValueError, TypeError):
            r.pop("parent_user")
    else:
        r.pop("parent_user", None)

    # status_format → status
    if "status_format" in r and "status" not in r:
        r["status"] = _STATUS_MAP.get(r.pop("status_format"), 1)
    else:
        r.pop("status_format", None)

    # type_format → type
    if "type_format" in r and "type" not in r:
        r["type"] = _TYPE_MAP.get(r.pop("type_format"), 1)
    else:
        r.pop("type_format", None)

    # Remove remaining non-model fields
    r.pop("user_parent_format", None)
    return r


def rename_report_funds(record: dict) -> dict:
    """Rename 'date' -> 'report_date' for report_funds records."""
    r = dict(record)
    if "date" in r and "report_date" not in r:
        r["report_date"] = r.pop("date")
    return r
