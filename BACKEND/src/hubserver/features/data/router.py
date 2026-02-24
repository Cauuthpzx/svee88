"""Data retrieval router — GET endpoints for the frontend data-table module.

Each endpoint queries the local DB (synced data) with support for:
- Pagination (page, limit)
- Text search (ILIKE) and exact-match filters
- Date range (parsed from 'YYYY-MM-DD | YYYY-MM-DD')
- Sorting (sort_field/sort_direction for members, Layui column sort for all)
"""

from datetime import datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio.session import AsyncSession

from ...core.db.database import async_get_db
from ..sync.member.model import Member
from ..sync.bet.model import BetOrder, BetLottery
from ..sync.finance.model import DepositWithdrawal
from ..sync.report.model import ReportFunds, ReportLottery, ReportThirdGame
from ..sync.config.model import BankList, InviteList

router = APIRouter(prefix="/data", tags=["data"])

# ── Model registry ──────────────────────────────────────────────────

_MODELS: dict[str, type] = {
    "members": Member,
    "invites": InviteList,
    "bets": BetLottery,
    "bet-orders": BetOrder,
    "report-lottery": ReportLottery,
    "report-funds": ReportFunds,
    "report-third": ReportThirdGame,
    "deposits": DepositWithdrawal,
    "withdrawals": DepositWithdrawal,
    "banks": BankList,
}

# Fields that use ILIKE (partial match)
_LIKE_FIELDS: set[str] = {
    "username", "serial_no", "platform_username",
    "invite_code", "card_number",
}

# Date column for range queries per endpoint
_DATE_COL: dict[str, str] = {
    "bets": "create_time",
    "bet-orders": "bet_time",
    "report-lottery": "report_date",
    "report-funds": "report_date",
    "report-third": "report_date",
    "deposits": "create_time",
    "withdrawals": "create_time",
}

# Default sort column per endpoint
_DEFAULT_SORT: dict[str, str] = {
    "members": "id",
    "invites": "id",
    "bets": "create_time",
    "bet-orders": "bet_time",
    "report-lottery": "report_date",
    "report-funds": "report_date",
    "report-third": "report_date",
    "deposits": "create_time",
    "withdrawals": "create_time",
    "banks": "id",
}

# Whitelist of query params allowed per endpoint
_ALLOWED_FILTERS: dict[str, set[str]] = {
    "members": {"username", "status"},
    "invites": {"invite_code", "user_type"},
    "bets": {"username", "serial_no", "lottery_id", "status"},
    "bet-orders": {"username", "serial_no", "platform_username"},
    "report-lottery": {"username", "lottery_id"},
    "report-funds": {"username"},
    "report-third": {"username", "platform_id"},
    "deposits": {"username", "type", "status"},
    "withdrawals": {"username", "serial_no", "status"},
    "banks": {"card_number"},
}


# ── Helpers ──────────────────────────────────────────────────────────

def _serialize(mapping: Any) -> dict:
    """Convert a SQLAlchemy row mapping to JSON-safe dict."""
    r: dict[str, Any] = {}
    for k, v in mapping.items():
        if isinstance(v, datetime):
            r[k] = v.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(v, Decimal):
            r[k] = float(v)
        else:
            r[k] = v
    return r


def _parse_date_range(val: str) -> tuple[str, str] | None:
    """Parse 'YYYY-MM-DD | YYYY-MM-DD' into (start, end) strings."""
    for sep in (" | ", " - "):
        if sep in val:
            parts = val.split(sep, 1)
            start, end = parts[0].strip(), parts[1].strip()
            if len(start) == 10 and len(end) == 10:
                return start, end
    return None


# ── Main endpoint ────────────────────────────────────────────────────

@router.get("/{endpoint}")
async def get_data(
    request: Request,
    endpoint: str,
    db: AsyncSession = Depends(async_get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=200),
) -> dict:
    """Generic paginated data retrieval for all synced endpoints."""
    model = _MODELS.get(endpoint)
    if not model:
        return {"code": 1, "msg": f"Unknown endpoint: {endpoint}"}

    table = model.__table__
    allowed = _ALLOWED_FILTERS.get(endpoint, set())

    # Collect query params (excluding pagination)
    params: dict[str, str] = dict(request.query_params)
    params.pop("page", None)
    params.pop("limit", None)

    # Extract sort params (members form sort + Layui column sort)
    sort_field = params.pop("sort_field", None)
    sort_direction = params.pop("sort_direction", "desc")

    # Layui table column sort (field + order) overrides form sort
    layui_field = params.pop("field", None)
    layui_order = params.pop("order", None)
    if layui_field:
        sort_field = layui_field
        sort_direction = layui_order or "desc"

    # Extract date range value (frontend sends as 'date', 'create_time', or 'bet_time')
    date_value = None
    for date_key in ("date", "create_time", "bet_time"):
        if date_key in params:
            date_value = params.pop(date_key)
            break

    # ── Build queries ──
    stmt = select(table)
    count_stmt = select(func.count()).select_from(table)

    # Always filter by agent_id if the model has it
    agent_col = table.c.get("agent_id")
    if agent_col is not None:
        agent_id = int(params.pop("agent_id", "1"))
        stmt = stmt.where(agent_col == agent_id)
        count_stmt = count_stmt.where(agent_col == agent_id)

    # Apply allowed filters
    for key, val in params.items():
        if not val or key not in allowed:
            continue
        col = table.c.get(key)
        if col is None:
            continue
        if key in _LIKE_FIELDS:
            stmt = stmt.where(col.ilike(f"%{val}%"))
            count_stmt = count_stmt.where(col.ilike(f"%{val}%"))
        else:
            stmt = stmt.where(col == val)
            count_stmt = count_stmt.where(col == val)

    # Apply date range
    date_col_name = _DATE_COL.get(endpoint)
    if date_col_name and date_value:
        parsed = _parse_date_range(date_value)
        if parsed:
            col = table.c.get(date_col_name)
            if col is not None:
                start_dt = datetime.fromisoformat(f"{parsed[0]}T00:00:00")
                end_dt = datetime.fromisoformat(f"{parsed[1]}T23:59:59")
                stmt = stmt.where(col.between(start_dt, end_dt))
                count_stmt = count_stmt.where(col.between(start_dt, end_dt))

    # Sorting
    if sort_field:
        col = table.c.get(sort_field)
        if col is not None:
            stmt = stmt.order_by(col.desc() if sort_direction == "desc" else col.asc())
    else:
        default_col = table.c.get(_DEFAULT_SORT.get(endpoint, "id"))
        if default_col is not None:
            stmt = stmt.order_by(default_col.desc())

    # Pagination
    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)

    # Execute
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    result = await db.execute(stmt)
    rows = [_serialize(r) for r in result.mappings().all()]

    return {"code": 0, "data": {"rows": rows, "count": total}}
