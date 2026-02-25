"""Data retrieval router — thin GET endpoint delegating to ``service.query_endpoint``."""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio.session import AsyncSession

from ...core.db.database import async_get_db
from ...core.deps import get_current_user
from .service import query_endpoint

router = APIRouter(
    prefix="/data",
    tags=["data"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/{endpoint}")
async def get_data(
    request: Request,
    endpoint: str,
    db: AsyncSession = Depends(async_get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=200),
) -> dict:
    """Generic paginated data retrieval for all synced endpoints."""
    params: dict[str, str] = dict(request.query_params)
    params.pop("page", None)
    params.pop("limit", None)

    # Extract sort params (members form sort + Layui column sort)
    sort_field = params.pop("sort_field", None)
    sort_direction = params.pop("sort_direction", "desc")

    # Layui table column sort overrides form sort
    layui_field = params.pop("field", None)
    layui_order = params.pop("order", None)
    if layui_field:
        sort_field = layui_field
        sort_direction = layui_order or "desc"

    # Extract date range value
    date_value = None
    for date_key in ("date", "create_time", "bet_time"):
        if date_key in params:
            date_value = params.pop(date_key)
            break

    return await query_endpoint(
        db=db,
        endpoint=endpoint,
        filters=params,
        page=page,
        limit=limit,
        sort_field=sort_field,
        sort_direction=sort_direction,
        date_value=date_value,
    )
