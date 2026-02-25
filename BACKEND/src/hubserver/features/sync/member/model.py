from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, Numeric, SmallInteger, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ....core.db.database import Base


class Member(Base):
    __tablename__ = "members"
    __table_args__ = (
        UniqueConstraint("agent_id", "username", name="uq_members_agent_username"),
        Index("idx_members_username", "username"),
        Index("idx_members_money", "money"),
        Index("idx_members_login_time", "login_time"),
        Index("idx_members_register_time", "register_time"),
        Index("idx_members_user_parent", "user_parent"),
        Index("idx_members_agent_status", "agent_id", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50))
    register_time: Mapped[datetime] = mapped_column(DateTime)
    create_time: Mapped[datetime] = mapped_column(DateTime)
    update_time: Mapped[datetime] = mapped_column(DateTime)
    agent_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("agents.id"), default=1)
    user_parent: Mapped[int | None] = mapped_column(Integer, default=None)
    user_tree: Mapped[dict | None] = mapped_column(JSONB, default=None)
    level: Mapped[int] = mapped_column(SmallInteger, default=0)
    type: Mapped[int] = mapped_column(SmallInteger, default=1)
    group_id: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[int] = mapped_column(SmallInteger, default=1)
    login_ip: Mapped[str | None] = mapped_column(String(45), default=None)
    useragent: Mapped[str | None] = mapped_column(Text, default=None)
    device: Mapped[str | None] = mapped_column(String(50), default=None)
    login_time: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    register_ip: Mapped[str | None] = mapped_column(String(45), default=None)
    truename: Mapped[str | None] = mapped_column(String(100), default=None)
    phone: Mapped[str | None] = mapped_column(String(20), default=None)
    email: Mapped[str | None] = mapped_column(String(255), default=None)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    remark: Mapped[str | None] = mapped_column(Text, default=None)
    note: Mapped[str | None] = mapped_column(Text, default=None)
    invite_code: Mapped[str | None] = mapped_column(String(50), default=None)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    phone_verified_time: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    agent_type: Mapped[int] = mapped_column(SmallInteger, default=0)
    is_tester: Mapped[bool] = mapped_column(Boolean, default=False)
    first_deposit_time: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    money: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    deposit_times: Mapped[int] = mapped_column(Integer, default=0)
    deposit_money: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    withdrawal_times: Mapped[int] = mapped_column(Integer, default=0)
    withdrawal_money: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
