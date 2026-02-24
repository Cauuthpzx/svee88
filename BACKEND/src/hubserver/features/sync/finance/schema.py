from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class DepositWithdrawalBase(BaseModel):
    id: int
    create_time: datetime
    agent_id: int = 1
    serial_no: str
    uid: int
    amount: Decimal
    true_amount: Decimal
    category_id: int
    type: str
    username: str
    status: str
    prostatus: int
    update_time: datetime


class DepositWithdrawalRead(DepositWithdrawalBase):
    user_parent: int | None = None
    group_id: int = 0
    firm_fee: Decimal = Decimal("0")
    user_fee: Decimal = Decimal("0")
    rebate: Decimal | None = None
    name: str | None = None
    bank_id: int = 0
    branch: str | None = None
    account: str | None = None
    transfer_time: datetime | None = None
    remark: str | None = None
    user_remark: str | None = None
    operator: int = 0
    prize_amount: Decimal = Decimal("0")
    activity_id: int = 0
    merchant_id: int = 0
    pay_type: int = 0
    trade_id: str | None = None
    is_tester: bool = False
    success_time: datetime | None = None
    review_time: datetime | None = None
    currency: int = 1


class DepositWithdrawalCreateInternal(DepositWithdrawalBase):
    user_parent: int | None = None
    user_tree: dict | list | None = None
    group_id: int = 0
    firm_fee: Decimal = Decimal("0")
    user_fee: Decimal = Decimal("0")
    rebate: Decimal | None = None
    name: str | None = None
    bank_id: int = 0
    branch: str | None = None
    account: str | None = None
    transfer_time: datetime | None = None
    remark: str | None = None
    user_remark: str | None = None
    operator: int = 0
    prize_amount: Decimal = Decimal("0")
    activity_id: int = 0
    extra: dict | list | None = None
    merchant_id: int = 0
    pay_type: int = 0
    trade_id: str | None = None
    is_tester: bool = False
    success_time: datetime | None = None
    review_time: datetime | None = None
    transfer_record: str | None = None
    currency: int = 1


class DepositWithdrawalUpdate(BaseModel):
    status: str | None = None
    prostatus: int | None = None
    update_time: datetime | None = None


class DepositWithdrawalUpdateInternal(DepositWithdrawalUpdate):
    pass


class DepositWithdrawalDelete(BaseModel):
    pass
