from datetime import datetime
from typing import Any

from pydantic import BaseModel


class SyncRequest(BaseModel):
    """Generic sync request with a list of records."""
    data: list[dict[str, Any]]
    agent_id: int = 1


class SyncResponse(BaseModel):
    """Sync response with count of processed records."""
    processed: int
    endpoint: str
    status: str = "ok"
    last_data_date: str | None = None


class SyncStatusResponse(BaseModel):
    """Status of all sync endpoints."""
    endpoints: list[dict[str, Any]]


class VerifyRequest(BaseModel):
    """Verify request with list of IDs to check."""
    ids: list[int]


# --- SyncMetadata CRUD schemas ---

class SyncMetadataBase(BaseModel):
    agent_id: int = 1
    endpoint: str


class SyncMetadataRead(SyncMetadataBase):
    id: int
    last_sync_at: datetime
    last_sync_count: int = 0
    sync_status: str = "idle"
    error_message: str | None = None
    sync_params: dict | None = None
    created_at: datetime
    updated_at: datetime


class SyncMetadataCreateInternal(SyncMetadataBase):
    last_sync_at: datetime | None = None
    last_sync_count: int = 0
    sync_status: str = "idle"
    error_message: str | None = None
    sync_params: dict | None = None


class SyncMetadataUpdate(BaseModel):
    last_sync_at: datetime | None = None
    last_sync_count: int | None = None
    sync_status: str | None = None
    error_message: str | None = None
    sync_params: dict | None = None


class SyncMetadataUpdateInternal(SyncMetadataUpdate):
    updated_at: datetime | None = None


class SyncMetadataDelete(BaseModel):
    pass
