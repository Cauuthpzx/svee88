from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, DateTime, Index, Integer, Numeric, SmallInteger, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ....core.db.database import Base


class DepositWithdrawal(Base):
    __tablename__ = "deposit_withdrawal"
    __table_args__ = (
        Index("idx_dw_serial_no", "serial_no", "create_time", unique=True),
        Index("idx_dw_uid_create", "uid", "create_time"),
        Index("idx_dw_username_create", "username", "create_time"),
        Index("idx_dw_category_create", "category_id", "create_time"),
        Index("idx_dw_prostatus_create", "prostatus", "create_time"),
        Index("idx_dw_agent_create", "agent_id", "create_time"),
        {
            "postgresql_partition_by": "RANGE (create_time)",
        },
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    create_time: Mapped[datetime] = mapped_column(DateTime, primary_key=True)
    serial_no: Mapped[str] = mapped_column(String(50))
    uid: Mapped[int] = mapped_column(Integer)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 4))
    true_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4))
    status: Mapped[str] = mapped_column(String(50))
    prostatus: Mapped[int] = mapped_column(SmallInteger)
    category_id: Mapped[int] = mapped_column(SmallInteger)
    type: Mapped[str] = mapped_column(String(20))
    username: Mapped[str] = mapped_column(String(50))
    update_time: Mapped[datetime] = mapped_column(DateTime)
    agent_id: Mapped[int] = mapped_column(SmallInteger, default=1)
    user_parent: Mapped[int | None] = mapped_column(Integer, default=None)
    user_tree: Mapped[dict | None] = mapped_column(JSONB, default=None)
    group_id: Mapped[int] = mapped_column(Integer, default=0)
    firm_fee: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    user_fee: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    rebate: Mapped[Decimal | None] = mapped_column(Numeric(15, 4), default=None)
    name: Mapped[str | None] = mapped_column(String(255), default=None)
    bank_id: Mapped[int] = mapped_column(Integer, default=0)
    branch: Mapped[str | None] = mapped_column(String(255), default=None)
    account: Mapped[str | None] = mapped_column(String(50), default=None)
    transfer_time: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    remark: Mapped[str | None] = mapped_column(Text, default=None)
    user_remark: Mapped[str | None] = mapped_column(String(255), default=None)
    operator: Mapped[int] = mapped_column(Integer, default=0)
    prize_amount: Mapped[Decimal] = mapped_column(Numeric(15, 4), default=Decimal("0"))
    activity_id: Mapped[int] = mapped_column(Integer, default=0)
    extra: Mapped[dict | None] = mapped_column(JSONB, default=None)
    merchant_id: Mapped[int] = mapped_column(Integer, default=0)
    pay_type: Mapped[int] = mapped_column(SmallInteger, default=0)
    trade_id: Mapped[str | None] = mapped_column(String(50), default=None)
    is_tester: Mapped[bool] = mapped_column(Boolean, default=False)
    success_time: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    review_time: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    transfer_record: Mapped[str | None] = mapped_column(Text, default=None)
    currency: Mapped[int] = mapped_column(SmallInteger, default=1)
