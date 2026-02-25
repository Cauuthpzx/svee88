"""Data query service — generic paginated queries for synced upstream data.

Handles filter building, ILIKE escaping, date ranges, sorting (whitelisted),
and pagination. All SQLAlchemy query logic lives here, keeping the router thin.
"""

from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Table, func, select
from sqlalchemy.ext.asyncio.session import AsyncSession

from ..sync.bet.model import BetLottery, BetOrder
from ..sync.config.model import BankList, InviteList
from ..sync.finance.model import DepositWithdrawal
from ..sync.member.model import Member
from ..sync.report.model import ReportFunds, ReportLottery, ReportThirdGame

# ── Model registry ──────────────────────────────────────────────────

MODELS: dict[str, type] = {
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

# Whitelist of sortable columns per endpoint
_ALLOWED_SORT: dict[str, set[str]] = {
    "members": {
        "id", "username", "money", "login_time", "register_time",
        "deposit_money", "withdrawal_money", "status",
    },
    "invites": {"id", "create_time", "reg_count"},
    "bets": {"create_time", "money", "serial_no"},
    "bet-orders": {"bet_time", "bet_amount", "prize", "win_lose"},
    "report-lottery": {"report_date", "bet_count", "bet_amount", "win_lose", "prize"},
    "report-funds": {"report_date", "deposit_amount", "withdrawal_amount"},
    "report-third": {"report_date", "t_bet_amount", "t_prize", "t_win_lose"},
    "deposits": {"create_time", "amount"},
    "withdrawals": {"create_time", "amount"},
    "banks": {"id"},
}


# ── Helpers ──────────────────────────────────────────────────────────


def _escape_like(val: str) -> str:
    """Escape SQL LIKE/ILIKE wildcard characters (``%`` and ``_``)."""
    return val.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def serialize_row(mapping: Any) -> dict[str, Any]:
    """Convert a SQLAlchemy row mapping to a JSON-safe dict."""
    result: dict[str, Any] = {}
    for key, value in mapping.items():
        if isinstance(value, datetime):
            result[key] = value.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(value, Decimal):
            result[key] = float(value)
        else:
            result[key] = value
    return result


def parse_date_range(val: str) -> tuple[str, str] | None:
    """Parse ``'YYYY-MM-DD | YYYY-MM-DD'`` into ``(start, end)`` strings."""
    for sep in (" | ", " - "):
        if sep in val:
            parts = val.split(sep, 1)
            start, end = parts[0].strip(), parts[1].strip()
            if len(start) == 10 and len(end) == 10:
                return start, end
    return None


def _apply_filters(
    stmt: Any,
    table: Table,
    endpoint: str,
    filters: dict[str, str],
) -> Any:
    """Apply whitelisted equality and ILIKE filters to a SELECT statement."""
    allowed = _ALLOWED_FILTERS.get(endpoint, set())
    for key, val in filters.items():
        if not val or key not in allowed:
            continue
        col = table.c.get(key)
        if col is None:
            continue
        if key in _LIKE_FIELDS:
            escaped = _escape_like(val)
            stmt = stmt.where(col.ilike(f"%{escaped}%", escape="\\"))
        else:
            stmt = stmt.where(col == val)
    return stmt


def _apply_date_range(stmt: Any, table: Table, endpoint: str, date_value: str | None) -> Any:
    """Apply a date-range filter if the endpoint supports it."""
    date_col_name = _DATE_COL.get(endpoint)
    if not date_col_name or not date_value:
        return stmt
    parsed = parse_date_range(date_value)
    if not parsed:
        return stmt
    col = table.c.get(date_col_name)
    if col is None:
        return stmt
    start_dt = datetime.fromisoformat(f"{parsed[0]}T00:00:00")
    end_dt = datetime.fromisoformat(f"{parsed[1]}T23:59:59")
    return stmt.where(col.between(start_dt, end_dt))


def _apply_sort(stmt: Any, table: Table, endpoint: str, sort_field: str | None, sort_direction: str) -> Any:
    """Apply sorting — only whitelisted columns are accepted."""
    allowed_sort = _ALLOWED_SORT.get(endpoint, set())
    if sort_field and sort_field in allowed_sort:
        col = table.c.get(sort_field)
        if col is not None:
            return stmt.order_by(col.desc() if sort_direction == "desc" else col.asc())

    default_col = table.c.get(_DEFAULT_SORT.get(endpoint, "id"))
    if default_col is not None:
        return stmt.order_by(default_col.desc())
    return stmt


# ── Main query function ─────────────────────────────────────────────


async def query_endpoint(
    db: AsyncSession,
    endpoint: str,
    filters: dict[str, str],
    page: int,
    limit: int,
    sort_field: str | None,
    sort_direction: str,
    date_value: str | None,
) -> dict[str, Any]:
    """Execute a paginated, filtered, sorted query for *endpoint*.

    Returns a standardized response dict:
    ``{"code": 0, "message": "success", "data": {"rows": [...], "count": N}, "errors": []}``
    """
    model = MODELS.get(endpoint)
    if model is None:
        return {"code": 1, "message": f"Unknown endpoint: {endpoint}", "data": None, "errors": []}

    table = model.__table__

    # Base statements
    stmt = select(table)
    count_stmt = select(func.count()).select_from(table)

    # Agent filter (if model has agent_id column)
    agent_col = table.c.get("agent_id")
    if agent_col is not None:
        raw_agent = filters.pop("agent_id", "1")
        try:
            agent_id = int(raw_agent)
        except (ValueError, TypeError):
            agent_id = 1
        stmt = stmt.where(agent_col == agent_id)
        count_stmt = count_stmt.where(agent_col == agent_id)

    # Filters
    stmt = _apply_filters(stmt, table, endpoint, filters)
    count_stmt = _apply_filters(count_stmt, table, endpoint, filters)

    # Date range
    stmt = _apply_date_range(stmt, table, endpoint, date_value)
    count_stmt = _apply_date_range(count_stmt, table, endpoint, date_value)

    # Sorting
    stmt = _apply_sort(stmt, table, endpoint, sort_field, sort_direction)

    # Pagination
    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)

    # Execute
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    result = await db.execute(stmt)
    rows = [serialize_row(r) for r in result.mappings().all()]

    return {"code": 0, "message": "success", "data": {"rows": rows, "count": total}, "errors": []}
