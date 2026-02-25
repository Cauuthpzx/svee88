from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.db.database import async_get_db
from ...core.deps import get_current_user
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException, DuplicateValueException
from ...core.security import get_password_hash
from ...core.config import APP_TZ
from .model import HubUser
from .schema import HubUserCreate, HubUserPermissionsUpdate, HubUserRead, HubUserUpdate, ROLE_DEFAULT_PERMISSIONS

router = APIRouter(tags=["hub-users"])

VALID_ROLES = {"ADMINHUB", "MODHUB", "USERHUB"}


def _require_admin(current_user: dict[str, Any]) -> None:
    """Chỉ ADMINHUB (is_superuser) mới được quản lý hub users."""
    if not current_user.get("is_superuser"):
        raise ForbiddenException("Chỉ ADMINHUB mới có quyền này.")


def _row_to_dict(row: HubUser) -> dict[str, Any]:
    return {
        "id": row.id,
        "username": row.username,
        "email": row.email,
        "role": row.role,
        "permissions": row.permissions,
        "is_active": row.is_active,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }


# ── GET /hub-users ──────────────────────────────────────────────────

@router.get("/hub-users", response_model=dict)
async def list_hub_users(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    _require_admin(current_user)
    result = await db.execute(select(HubUser).order_by(HubUser.id))
    rows = result.scalars().all()
    return {
        "code": 0,
        "data": [_row_to_dict(r) for r in rows],
        "count": len(rows),
    }


# ── POST /hub-users ─────────────────────────────────────────────────

@router.post("/hub-users", response_model=HubUserRead, status_code=201)
async def create_hub_user(
    body: HubUserCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    _require_admin(current_user)

    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=422, detail=f"Role phải là một trong: {VALID_ROLES}")

    exists = await db.execute(select(HubUser).where(HubUser.username == body.username))
    if exists.scalar_one_or_none():
        raise DuplicateValueException("Username đã tồn tại.")

    new_user = HubUser(
        username=body.username,
        hashed_password=get_password_hash(body.password),
        email=body.email,
        role=body.role,
        permissions=None,  # dùng role default
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return _row_to_dict(new_user)


# ── PUT /hub-users/{id} ─────────────────────────────────────────────

@router.put("/hub-users/{user_id}", response_model=dict)
async def update_hub_user(
    user_id: int,
    body: HubUserUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    _require_admin(current_user)

    result = await db.execute(select(HubUser).where(HubUser.id == user_id))
    row = result.scalar_one_or_none()
    if not row:
        raise NotFoundException("Hub user không tồn tại.")

    if body.role is not None and body.role not in VALID_ROLES:
        raise HTTPException(status_code=422, detail=f"Role phải là một trong: {VALID_ROLES}")

    update_data: dict[str, Any] = {"updated_at": datetime.now(APP_TZ)}
    if body.email is not None:
        update_data["email"] = body.email
    if body.role is not None:
        update_data["role"] = body.role
    if body.is_active is not None:
        update_data["is_active"] = body.is_active
    if body.password is not None:
        update_data["hashed_password"] = get_password_hash(body.password)

    await db.execute(update(HubUser).where(HubUser.id == user_id).values(**update_data))
    await db.commit()
    return {"code": 0, "message": "Cập nhật thành công.", "data": None, "errors": []}


# ── DELETE /hub-users/{id} ──────────────────────────────────────────

@router.delete("/hub-users/{user_id}", response_model=dict)
async def delete_hub_user(
    user_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    _require_admin(current_user)

    result = await db.execute(select(HubUser).where(HubUser.id == user_id))
    row = result.scalar_one_or_none()
    if not row:
        raise NotFoundException("Hub user không tồn tại.")

    await db.execute(delete(HubUser).where(HubUser.id == user_id))
    await db.commit()
    return {"code": 0, "message": "Đã xóa.", "data": None, "errors": []}


# ── GET /hub-users/{id}/permissions ────────────────────────────────

@router.get("/hub-users/{user_id}/permissions", response_model=dict)
async def get_hub_user_permissions(
    user_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    _require_admin(current_user)

    result = await db.execute(select(HubUser).where(HubUser.id == user_id))
    row = result.scalar_one_or_none()
    if not row:
        raise NotFoundException("Hub user không tồn tại.")

    # Trả về permissions override, hoặc role default nếu chưa set
    perms = row.permissions or ROLE_DEFAULT_PERMISSIONS.get(row.role, {"routes": [], "actions": []})
    return {"code": 0, "data": {"permissions": perms, "role": row.role}}


# ── PUT /hub-users/{id}/permissions ────────────────────────────────

@router.put("/hub-users/{user_id}/permissions", response_model=dict)
async def update_hub_user_permissions(
    user_id: int,
    body: HubUserPermissionsUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    _require_admin(current_user)

    result = await db.execute(select(HubUser).where(HubUser.id == user_id))
    row = result.scalar_one_or_none()
    if not row:
        raise NotFoundException("Hub user không tồn tại.")

    await db.execute(
        update(HubUser).where(HubUser.id == user_id).values(
            permissions=body.permissions,
            updated_at=datetime.now(APP_TZ),
        )
    )
    await db.commit()
    return {"code": 0, "message": "Đã lưu phân quyền.", "data": None, "errors": []}


# ── GET /hub-users/me/permissions ─────────────────────────────────
# Dùng khi frontend cần load permissions của user hiện tại

@router.get("/hub-users/me/permissions", response_model=dict)
async def get_my_permissions(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    username = current_user.get("username", "")
    result = await db.execute(select(HubUser).where(HubUser.username == username))
    row = result.scalar_one_or_none()

    if not row:
        # User chưa có hub_user record → trả full permissions nếu là superuser
        if current_user.get("is_superuser"):
            return {"code": 0, "data": ROLE_DEFAULT_PERMISSIONS["ADMINHUB"]}
        return {"code": 0, "data": {"routes": ["#/dashboard"], "actions": []}}

    perms = row.permissions or ROLE_DEFAULT_PERMISSIONS.get(row.role, {"routes": [], "actions": []})
    return {"code": 0, "data": perms}
