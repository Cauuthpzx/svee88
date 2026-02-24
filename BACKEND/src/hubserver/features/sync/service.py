"""Sync service helpers — shared logic for sync endpoints."""

from datetime import datetime
from typing import Any

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


# --- Sensitive field stripping for members ---

_SENSITIVE_FIELDS = {"password", "fund_password", "salt"}
_SKIP_FIELDS = {
    "type_format", "parent_user", "deposit_count", "deposit_amount",
    "withdrawal_count", "withdrawal_amount", "status_format", "user_parent_format",
}


def clean_member(record: dict) -> dict:
    """Remove sensitive and redundant fields from member records."""
    return {k: v for k, v in record.items() if k not in _SENSITIVE_FIELDS and k not in _SKIP_FIELDS}


def rename_report_funds(record: dict) -> dict:
    """Rename 'date' -> 'report_date' for report_funds records."""
    r = dict(record)
    if "date" in r and "report_date" not in r:
        r["report_date"] = r.pop("date")
    return r
