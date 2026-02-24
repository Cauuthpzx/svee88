"""Bulk upsert utility for syncing upstream data to local PostgreSQL."""

import json
from collections.abc import Sequence
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, Numeric, Table
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio.session import AsyncSession


def _build_coercions(table: Table) -> dict[str, str]:
    coercions: dict[str, str] = {}
    for col in table.columns:
        col_type = type(col.type)
        if col_type is DateTime or issubclass(col_type, DateTime):
            coercions[col.name] = "datetime"
        elif col_type is Date or issubclass(col_type, Date):
            coercions[col.name] = "date"
        elif col_type is JSONB:
            coercions[col.name] = "jsonb"
        elif col_type is Numeric or issubclass(col_type, Numeric):
            coercions[col.name] = "decimal"
    return coercions


def _coerce_value(value: Any, type_key: str) -> Any:
    if value is None or value == "":
        return None

    if type_key == "datetime":
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
                try:
                    return datetime.strptime(value, fmt)
                except ValueError:
                    continue
            try:
                return datetime.fromisoformat(value)
            except (ValueError, TypeError):
                return None
        return value

    if type_key == "date":
        if isinstance(value, (date, datetime)):
            return value if isinstance(value, date) else value.date()
        if isinstance(value, str):
            try:
                return datetime.strptime(value[:10], "%Y-%m-%d").date()
            except (ValueError, TypeError):
                return None
        return value

    if type_key == "jsonb":
        if isinstance(value, (dict, list)):
            return value
        if isinstance(value, str):
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        return value

    if type_key == "decimal":
        if isinstance(value, (int, float, Decimal)):
            return value
        if isinstance(value, str):
            try:
                return Decimal(value)
            except Exception:
                return None
        return value

    return value


def _coerce_record(record: dict[str, Any], coercions: dict[str, str]) -> dict[str, Any]:
    if not coercions:
        return record
    result = {}
    for k, v in record.items():
        if k in coercions:
            result[k] = _coerce_value(v, coercions[k])
        else:
            result[k] = v
    return result


async def bulk_upsert(
    session: AsyncSession,
    model: type,
    records: Sequence[dict[str, Any]],
    conflict_columns: list[str],
    update_columns: list[str] | None = None,
    chunk_size: int = 1000,
) -> int:
    if not records:
        return 0

    table: Table = model.__table__

    if update_columns is None:
        update_columns = [
            c.name for c in table.columns if c.name not in conflict_columns
        ]

    valid_cols = {c.name for c in table.columns}
    coercions = _build_coercions(table)

    total = 0
    for i in range(0, len(records), chunk_size):
        chunk = [
            _coerce_record({k: v for k, v in r.items() if k in valid_cols}, coercions)
            for r in records[i : i + chunk_size]
        ]
        if not chunk:
            continue
        stmt = pg_insert(table).values(chunk)
        stmt = stmt.on_conflict_do_update(
            index_elements=conflict_columns,
            set_={col: stmt.excluded[col] for col in update_columns},
        )
        await session.execute(stmt)
        total += len(chunk)

    await session.flush()
    return total
