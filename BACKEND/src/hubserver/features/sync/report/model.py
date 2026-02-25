import datetime as dt
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, Numeric, SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from ....core.config import APP_TZ
from ....core.db.database import Base


class ReportLottery(Base):
    __tablename__ = "report_lottery"
    __table_args__ = (
        Index("idx_report_lottery_date", "report_date"),
        Index("idx_report_lottery_uid_date", "uid", "report_date"),
        Index("idx_report_lottery_username_date", "username", "report_date"),
        Index("idx_report_lottery_lottery_date", "lottery_id", "report_date"),
    )

    report_date: Mapped[dt.date] = mapped_column(Date, primary_key=True)
    uid: Mapped[int] = mapped_column(Integer, primary_key=True)
    lottery_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    username: Mapped[str] = mapped_column(String(50))
    lottery_name: Mapped[str] = mapped_column(String(100))
    agent_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("agents.id"), primary_key=True, default=1)
    bet_count: Mapped[int] = mapped_column(Integer, default=0)
    bet_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    valid_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    rebate_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    result: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    win_lose: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    prize: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ)
    )


class ReportFunds(Base):
    __tablename__ = "report_funds"
    __table_args__ = (
        UniqueConstraint("agent_id", "report_date", "uid", name="uq_report_funds_agent_date_uid"),
        Index("idx_report_funds_date", "report_date"),
        Index("idx_report_funds_uid_date", "uid", "report_date"),
        Index("idx_report_funds_username_date", "username", "report_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uid: Mapped[int] = mapped_column(Integer)
    report_date: Mapped[dt.date] = mapped_column(Date)
    username: Mapped[str] = mapped_column(String(50))
    agent_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("agents.id"), primary_key=True, default=1)
    user_parent: Mapped[int | None] = mapped_column(Integer, default=None)
    deposit_count: Mapped[int] = mapped_column(Integer, default=0)
    deposit_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    withdrawal_count: Mapped[int] = mapped_column(Integer, default=0)
    withdrawal_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    charge_fee: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    agent_commission: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    promotion: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    third_rebate: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    third_activity_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ)
    )


class ReportThirdGame(Base):
    __tablename__ = "report_third_game"
    __table_args__ = (
        Index("idx_report_third_date", "report_date"),
        Index("idx_report_third_uid_date", "uid", "report_date"),
        Index("idx_report_third_username_date", "username", "report_date"),
        Index("idx_report_third_platform_date", "platform_id", "report_date"),
    )

    report_date: Mapped[dt.date] = mapped_column(Date, primary_key=True)
    uid: Mapped[int] = mapped_column(Integer, primary_key=True)
    platform_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50))
    platform_id_name: Mapped[str] = mapped_column(String(50))
    agent_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("agents.id"), primary_key=True, default=1)
    t_bet_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    t_bet_times: Mapped[int] = mapped_column(Integer, default=0)
    t_turnover: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    t_prize: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    t_win_lose: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(APP_TZ)
    )
