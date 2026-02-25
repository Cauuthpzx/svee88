from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, SmallInteger, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ...core.config import APP_TZ
from ...core.db.database import Base


class SyncMetadata(Base):
    __tablename__ = "sync_metadata"
    __table_args__ = (
        UniqueConstraint("agent_id", "endpoint", name="uq_sync_agent_endpoint"),
    )

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True, init=False)
    endpoint: Mapped[str] = mapped_column(String(50))
    agent_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("agents.id"), default=1)
    last_sync_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime(1970, 1, 1, tzinfo=APP_TZ)
    )
    last_sync_count: Mapped[int] = mapped_column(Integer, default=0)
    sync_status: Mapped[str] = mapped_column(String(20), default="idle")
    error_message: Mapped[str | None] = mapped_column(Text, default=None)
    sync_params: Mapped[dict | None] = mapped_column(JSONB, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ)
    )
