from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request
from fastcrud import PaginatedListResponse, compute_offset, paginated_response
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.deps import get_current_superuser
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import DuplicateValueException, NotFoundException
from .crud import crud_rate_limits, crud_tiers
from .schema import (
    RateLimitCreate,
    RateLimitCreateInternal,
    RateLimitRead,
    RateLimitUpdate,
    TierCreate,
    TierCreateInternal,
    TierRead,
    TierUpdate,
)

router = APIRouter(tags=["tiers"])


# --- Tier endpoints ---

@router.post("/tier", dependencies=[Depends(get_current_superuser)], status_code=201)
async def write_tier(
    request: Request, tier: TierCreate, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> dict[str, Any]:
    tier_internal_dict = tier.model_dump()
    db_tier = await crud_tiers.exists(db=db, name=tier_internal_dict["name"])
    if db_tier:
        raise DuplicateValueException("Tier name not available.")

    tier_internal = TierCreateInternal(**tier_internal_dict)
    created_tier = await crud_tiers.create(db=db, object=tier_internal, schema_to_select=TierRead)

    if created_tier is None:
        raise NotFoundException("Could not create tier.")

    return created_tier


@router.get("/tiers", response_model=PaginatedListResponse[TierRead])
async def read_tiers(
    request: Request, db: Annotated[AsyncSession, Depends(async_get_db)], page: int = Query(default=1, ge=1), items_per_page: int = Query(default=10, ge=1, le=100)
) -> dict:
    tiers_data = await crud_tiers.get_multi(db=db, offset=compute_offset(page, items_per_page), limit=items_per_page)

    response: dict[str, Any] = paginated_response(crud_data=tiers_data, page=page, items_per_page=items_per_page)
    return response


@router.get("/tier/{name}", response_model=TierRead)
async def read_tier(request: Request, name: str, db: Annotated[AsyncSession, Depends(async_get_db)]) -> dict[str, Any]:
    db_tier = await crud_tiers.get(db=db, name=name, schema_to_select=TierRead)
    if db_tier is None:
        raise NotFoundException("Tier not found.")

    return db_tier


@router.patch("/tier/{name}", dependencies=[Depends(get_current_superuser)])
async def patch_tier(
    request: Request, name: str, values: TierUpdate, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> dict[str, str]:
    db_tier = await crud_tiers.get(db=db, name=name, schema_to_select=TierRead)
    if db_tier is None:
        raise NotFoundException("Tier not found.")

    await crud_tiers.update(db=db, object=values, name=name)
    return {"message": "Tier updated."}


@router.delete("/tier/{name}", dependencies=[Depends(get_current_superuser)])
async def erase_tier(request: Request, name: str, db: Annotated[AsyncSession, Depends(async_get_db)]) -> dict[str, str]:
    db_tier = await crud_tiers.get(db=db, name=name, schema_to_select=TierRead)
    if db_tier is None:
        raise NotFoundException("Tier not found.")

    await crud_tiers.delete(db=db, name=name)
    return {"message": "Tier deleted."}


# --- Rate limit endpoints ---

@router.post("/tier/{tier_name}/rate_limit", dependencies=[Depends(get_current_superuser)], status_code=201)
async def write_rate_limit(
    request: Request, tier_name: str, rate_limit: RateLimitCreate, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> dict[str, Any]:
    db_tier = await crud_tiers.get(db=db, name=tier_name, schema_to_select=TierRead)
    if not db_tier:
        raise NotFoundException("Tier not found.")

    rate_limit_internal_dict = rate_limit.model_dump()
    rate_limit_internal_dict["tier_id"] = db_tier["id"]

    db_rate_limit = await crud_rate_limits.exists(db=db, name=rate_limit_internal_dict["name"])
    if db_rate_limit:
        raise DuplicateValueException("Rate limit name not available.")

    rate_limit_internal = RateLimitCreateInternal(**rate_limit_internal_dict)
    created_rate_limit = await crud_rate_limits.create(
        db=db, object=rate_limit_internal, schema_to_select=RateLimitRead
    )

    if created_rate_limit is None:
        raise NotFoundException("Could not create rate limit.")

    return created_rate_limit


@router.get("/tier/{tier_name}/rate_limits", response_model=PaginatedListResponse[RateLimitRead])
async def read_rate_limits(
    request: Request,
    tier_name: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    page: int = Query(default=1, ge=1),
    items_per_page: int = Query(default=10, ge=1, le=100),
) -> dict:
    db_tier = await crud_tiers.get(db=db, name=tier_name, schema_to_select=TierRead)
    if not db_tier:
        raise NotFoundException("Tier not found.")

    rate_limits_data = await crud_rate_limits.get_multi(
        db=db,
        offset=compute_offset(page, items_per_page),
        limit=items_per_page,
        tier_id=db_tier["id"],
    )

    response: dict[str, Any] = paginated_response(crud_data=rate_limits_data, page=page, items_per_page=items_per_page)
    return response


@router.get("/tier/{tier_name}/rate_limit/{id}", response_model=RateLimitRead)
async def read_rate_limit(
    request: Request, tier_name: str, id: int, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> dict[str, Any]:
    db_tier = await crud_tiers.get(db=db, name=tier_name, schema_to_select=TierRead)
    if not db_tier:
        raise NotFoundException("Tier not found.")

    db_rate_limit = await crud_rate_limits.get(db=db, tier_id=db_tier["id"], id=id, schema_to_select=RateLimitRead)
    if db_rate_limit is None:
        raise NotFoundException("Rate limit not found.")

    return db_rate_limit


@router.patch("/tier/{tier_name}/rate_limit/{id}", dependencies=[Depends(get_current_superuser)])
async def patch_rate_limit(
    request: Request,
    tier_name: str,
    id: int,
    values: RateLimitUpdate,
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict[str, str]:
    db_tier = await crud_tiers.get(db=db, name=tier_name, schema_to_select=TierRead)
    if not db_tier:
        raise NotFoundException("Tier not found.")

    db_rate_limit = await crud_rate_limits.get(db=db, tier_id=db_tier["id"], id=id, schema_to_select=RateLimitRead)
    if db_rate_limit is None:
        raise NotFoundException("Rate limit not found.")

    await crud_rate_limits.update(db=db, object=values, id=id)
    return {"message": "Rate limit updated."}


@router.delete("/tier/{tier_name}/rate_limit/{id}", dependencies=[Depends(get_current_superuser)])
async def erase_rate_limit(
    request: Request, tier_name: str, id: int, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> dict[str, str]:
    db_tier = await crud_tiers.get(db=db, name=tier_name, schema_to_select=TierRead)
    if not db_tier:
        raise NotFoundException("Tier not found.")

    db_rate_limit = await crud_rate_limits.get(db=db, tier_id=db_tier["id"], id=id, schema_to_select=RateLimitRead)
    if db_rate_limit is None:
        raise NotFoundException("Rate limit not found.")

    await crud_rate_limits.delete(db=db, id=id)
    return {"message": "Rate limit deleted."}
