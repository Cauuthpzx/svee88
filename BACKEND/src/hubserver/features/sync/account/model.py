from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ....core.config import APP_TZ
from ....core.db.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True, init=False)
    owner: Mapped[str] = mapped_column(String(100))
    username: Mapped[str] = mapped_column(String(100))
    base_url: Mapped[str] = mapped_column(String(255))
    cookie: Mapped[str | None] = mapped_column(Text, default=None)
    password_enc: Mapped[str | None] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ), init=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ), init=False
    )
