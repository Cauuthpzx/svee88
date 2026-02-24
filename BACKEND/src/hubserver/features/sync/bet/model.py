from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, DateTime, Index, Integer, Numeric, SmallInteger, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ....core.db.database import Base


class BetOrder(Base):
    __tablename__ = "bet_order"
    __table_args__ = (
        Index("idx_bo_serial_no", "serial_no", "bet_time", unique=True),
        Index("idx_bo_uid_bettime", "uid", "bet_time"),
        Index("idx_bo_platform_username_bettime", "platform_username", "bet_time"),
        Index("idx_bo_platform_bettime", "platform_id", "bet_time"),
        Index("idx_bo_agent_bettime", "agent_id", "bet_time"),
        Index("idx_bo_cid_bettime", "cid", "bet_time"),
        {
            "postgresql_partition_by": "RANGE (bet_time)",
        },
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    bet_time: Mapped[datetime] = mapped_column(DateTime, primary_key=True)
    serial_no: Mapped[str] = mapped_column(String(50))
    cid: Mapped[int] = mapped_column(SmallInteger)
    platform_id: Mapped[int] = mapped_column(Integer)
    uid: Mapped[int] = mapped_column(Integer)
    game_name: Mapped[str] = mapped_column(String(255))
    game_code: Mapped[str] = mapped_column(String(50))
    platform_id_name: Mapped[str] = mapped_column(String(50))
    c_name: Mapped[str] = mapped_column(String(100))
    platform_username: Mapped[str] = mapped_column(String(100))
    create_time: Mapped[datetime] = mapped_column(DateTime)
    update_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    agent_id: Mapped[int] = mapped_column(SmallInteger, default=1)
    bet_amount: Mapped[int] = mapped_column(BigInteger, default=0)
    turnover: Mapped[int] = mapped_column(BigInteger, default=0)
    prize: Mapped[int] = mapped_column(BigInteger, default=0)
    win_lose: Mapped[int] = mapped_column(BigInteger, default=0)
    extra: Mapped[str | None] = mapped_column(String(50), default=None)
    origin: Mapped[str | None] = mapped_column(String(50), default=None)
    prizetime: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    delete_time: Mapped[int] = mapped_column(Integer, default=0)


class BetLottery(Base):
    __tablename__ = "bet_lottery"
    __table_args__ = (
        Index("idx_bl_serial_no", "serial_no", "create_time", unique=True),
        Index("idx_bl_uid_create", "uid", "create_time"),
        Index("idx_bl_username_create", "username", "create_time"),
        Index("idx_bl_lottery_create", "lottery_id", "create_time"),
        Index("idx_bl_status_create", "status", "create_time"),
        Index("idx_bl_agent_create", "agent_id", "create_time"),
        {
            "postgresql_partition_by": "RANGE (create_time)",
        },
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    create_time: Mapped[datetime] = mapped_column(DateTime, primary_key=True)
    serial_no: Mapped[str] = mapped_column(String(50))
    uid: Mapped[int] = mapped_column(Integer)
    issue: Mapped[str] = mapped_column(String(20))
    issue_id: Mapped[int] = mapped_column(Integer)
    lottery_id: Mapped[int] = mapped_column(Integer)
    lottery_name: Mapped[str] = mapped_column(String(100))
    play_id: Mapped[int] = mapped_column(Integer)
    play_type_id: Mapped[int] = mapped_column(Integer)
    odds_id: Mapped[int] = mapped_column(Integer)
    odds: Mapped[Decimal] = mapped_column(Numeric(7, 4))
    content: Mapped[str] = mapped_column(String(500))
    count: Mapped[int] = mapped_column(Integer)
    price: Mapped[int] = mapped_column(BigInteger)
    money: Mapped[int] = mapped_column(BigInteger)
    username: Mapped[str] = mapped_column(String(50))
    update_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    agent_id: Mapped[int] = mapped_column(SmallInteger, default=1)
    user_parent: Mapped[int | None] = mapped_column(Integer, default=None)
    user_tree: Mapped[dict | None] = mapped_column(JSONB, default=None)
    bet_data_set: Mapped[dict | None] = mapped_column(JSONB, default=None)
    win_count: Mapped[int] = mapped_column(Integer, default=0)
    real_count: Mapped[int] = mapped_column(Integer, default=0)
    real_win_count: Mapped[int] = mapped_column(Integer, default=0)
    rebate: Mapped[int] = mapped_column(BigInteger, default=0)
    rebate_amount: Mapped[int] = mapped_column(BigInteger, default=0)
    result: Mapped[int] = mapped_column(BigInteger, default=0)
    prize: Mapped[int] = mapped_column(BigInteger, default=0)
    status: Mapped[int] = mapped_column(SmallInteger, default=0)
    commission_status: Mapped[int] = mapped_column(SmallInteger, default=0)
    source: Mapped[int] = mapped_column(SmallInteger, default=0)
    prize_time: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    ip: Mapped[str | None] = mapped_column(String(45), default=None)
    is_tester: Mapped[bool] = mapped_column(Boolean, default=False)
