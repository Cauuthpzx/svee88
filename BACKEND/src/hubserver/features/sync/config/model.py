from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, SmallInteger, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ....core.db.database import Base


class LotterySeries(Base):
    __tablename__ = "lottery_series"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    agent_id: Mapped[int] = mapped_column(SmallInteger, default=1)


class LotteryGame(Base):
    __tablename__ = "lottery_games"
    __table_args__ = (
        Index("idx_lottery_games_series", "series_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    series_id: Mapped[int] = mapped_column(Integer, ForeignKey("lottery_series.id"))
    agent_id: Mapped[int] = mapped_column(SmallInteger, default=1)


class BankList(Base):
    __tablename__ = "bank_list"
    __table_args__ = (
        Index("idx_bank_list_agent", "agent_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bank: Mapped[str] = mapped_column(String(100))
    create_time: Mapped[datetime] = mapped_column(DateTime)
    agent_id: Mapped[int] = mapped_column(SmallInteger, default=1)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    branch: Mapped[str | None] = mapped_column(String(255), default=None)
    card_number: Mapped[str | None] = mapped_column(String(30), default=None)


class InviteList(Base):
    __tablename__ = "invite_list"
    __table_args__ = (
        UniqueConstraint("agent_id", "invite_code", name="uq_invite_agent_code"),
        Index("idx_invite_list_uid", "uid"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uid: Mapped[int] = mapped_column(Integer)
    invite_code: Mapped[str] = mapped_column(String(50))
    create_time: Mapped[datetime] = mapped_column(DateTime)
    update_time: Mapped[datetime] = mapped_column(DateTime)
    agent_id: Mapped[int] = mapped_column(SmallInteger, default=1)
    group_id: Mapped[int] = mapped_column(Integer, default=0)
    user_type: Mapped[str | None] = mapped_column(String(50), default=None)
    rebate_arr: Mapped[dict | None] = mapped_column(JSONB, default=None)
    reg_count: Mapped[int] = mapped_column(Integer, default=0)
    remark: Mapped[str | None] = mapped_column(Text, default=None)
    recharge_count: Mapped[int] = mapped_column(Integer, default=0)
    first_recharge_count: Mapped[int] = mapped_column(Integer, default=0)
    register_recharge_count: Mapped[int] = mapped_column(Integer, default=0)
    scope_reg_count: Mapped[int] = mapped_column(Integer, default=0)
