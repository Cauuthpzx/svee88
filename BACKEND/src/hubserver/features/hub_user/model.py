from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ....core.config import APP_TZ
from ....core.db.database import Base


class HubUser(Base):
    __tablename__ = "hub_users"

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True, init=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(100), default=None)
    role: Mapped[str] = mapped_column(String(20), default="USERHUB", index=True)
    permissions: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ), init=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ), init=False
    )
