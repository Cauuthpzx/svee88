from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Default permissions per role
ROLE_DEFAULT_PERMISSIONS: dict[str, dict[str, list[str]]] = {
    "ADMINHUB": {
        "routes": ["*"],
        "actions": ["*"],
    },
    "MODHUB": {
        "routes": [
            "#/dashboard",
            "#/users",
            "#/invite-list",
            "#/report-lottery",
            "#/report-funds",
            "#/report-provider",
            "#/deposit-list",
            "#/withdrawal-history",
            "#/bet-list",
            "#/bet-third-party",
            "#/rebate-list",
            "#/settings-sync",
        ],
        "actions": ["export", "print", "sync_run", "sync_add_account"],
    },
    "USERHUB": {
        "routes": [
            "#/dashboard",
            "#/users",
            "#/report-lottery",
            "#/report-funds",
            "#/report-provider",
            "#/deposit-list",
            "#/withdrawal-history",
            "#/bet-list",
            "#/bet-third-party",
        ],
        "actions": [],
    },
}


class HubUserRead(BaseModel):
    id: int
    username: str
    email: str | None
    role: str
    permissions: dict[str, Any] | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class HubUserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=6, max_length=128)
    email: str | None = Field(default=None)
    role: str = Field(default="USERHUB")

    @property
    def valid_role(self) -> bool:
        return self.role in ("ADMINHUB", "MODHUB", "USERHUB")


class HubUserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str | None = None
    role: str | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)
    is_active: bool | None = None


class HubUserPermissionsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    permissions: dict[str, Any]
