from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class MemberBase(BaseModel):
    id: int
    agent_id: int = 1
    username: str
    user_parent: int | None = None
    level: int = 0
    type: int = 1
    group_id: int = 0
    status: int = 1
    register_time: datetime
    create_time: datetime
    update_time: datetime


class MemberRead(MemberBase):
    user_tree: dict | list | None = None
    login_ip: str | None = None
    device: str | None = None
    login_time: datetime | None = None
    register_ip: str | None = None
    truename: str | None = None
    phone: str | None = None
    email: str | None = None
    email_verified: bool = False
    invite_code: str | None = None
    phone_verified: bool = False
    agent_type: int = 0
    is_tester: bool = False
    first_deposit_time: datetime | None = None
    money: Decimal = Decimal("0")
    deposit_times: int = 0
    deposit_money: Decimal = Decimal("0")
    withdrawal_times: int = 0
    withdrawal_money: Decimal = Decimal("0")


class MemberCreateInternal(MemberBase):
    user_tree: dict | list | None = None
    login_ip: str | None = None
    useragent: str | None = None
    device: str | None = None
    login_time: datetime | None = None
    register_ip: str | None = None
    truename: str | None = None
    phone: str | None = None
    email: str | None = None
    email_verified: bool = False
    remark: str | None = None
    note: str | None = None
    invite_code: str | None = None
    phone_verified: bool = False
    phone_verified_time: datetime | None = None
    agent_type: int = 0
    is_tester: bool = False
    first_deposit_time: datetime | None = None
    money: Decimal = Decimal("0")
    deposit_times: int = 0
    deposit_money: Decimal = Decimal("0")
    withdrawal_times: int = 0
    withdrawal_money: Decimal = Decimal("0")


class MemberUpdate(BaseModel):
    status: int | None = None
    money: Decimal | None = None
    login_time: datetime | None = None
    login_ip: str | None = None
    update_time: datetime | None = None


class MemberUpdateInternal(MemberUpdate):
    pass


class MemberDelete(BaseModel):
    pass
