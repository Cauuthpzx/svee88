import datetime as dt
from decimal import Decimal

from pydantic import BaseModel


# --- ReportLottery ---

class ReportLotteryBase(BaseModel):
    agent_id: int = 1
    report_date: dt.date
    uid: int
    lottery_id: int
    username: str
    lottery_name: str


class ReportLotteryRead(ReportLotteryBase):
    bet_count: int = 0
    bet_amount: Decimal = Decimal("0")
    valid_amount: Decimal = Decimal("0")
    rebate_amount: Decimal = Decimal("0")
    result: Decimal = Decimal("0")
    win_lose: Decimal = Decimal("0")
    prize: Decimal = Decimal("0")


class ReportLotteryCreateInternal(ReportLotteryRead):
    pass


class ReportLotteryUpdate(BaseModel):
    bet_count: int | None = None
    bet_amount: Decimal | None = None
    win_lose: Decimal | None = None
    prize: Decimal | None = None


class ReportLotteryUpdateInternal(ReportLotteryUpdate):
    pass


class ReportLotteryDelete(BaseModel):
    pass


# --- ReportFunds ---

class ReportFundsBase(BaseModel):
    agent_id: int = 1
    id: int
    uid: int
    report_date: dt.date
    username: str


class ReportFundsRead(ReportFundsBase):
    user_parent: int | None = None
    deposit_count: int = 0
    deposit_amount: Decimal = Decimal("0")
    withdrawal_count: int = 0
    withdrawal_amount: Decimal = Decimal("0")
    charge_fee: Decimal = Decimal("0")
    agent_commission: Decimal = Decimal("0")
    promotion: Decimal = Decimal("0")
    third_rebate: Decimal = Decimal("0")
    third_activity_amount: Decimal = Decimal("0")


class ReportFundsCreateInternal(ReportFundsRead):
    pass


class ReportFundsUpdate(BaseModel):
    deposit_count: int | None = None
    deposit_amount: Decimal | None = None
    withdrawal_count: int | None = None
    withdrawal_amount: Decimal | None = None


class ReportFundsUpdateInternal(ReportFundsUpdate):
    pass


class ReportFundsDelete(BaseModel):
    pass


# --- ReportThirdGame ---

class ReportThirdGameBase(BaseModel):
    agent_id: int = 1
    report_date: dt.date
    uid: int
    platform_id: int
    username: str
    platform_id_name: str


class ReportThirdGameRead(ReportThirdGameBase):
    t_bet_amount: Decimal = Decimal("0")
    t_bet_times: int = 0
    t_turnover: Decimal = Decimal("0")
    t_prize: Decimal = Decimal("0")
    t_win_lose: Decimal = Decimal("0")


class ReportThirdGameCreateInternal(ReportThirdGameRead):
    pass


class ReportThirdGameUpdate(BaseModel):
    t_bet_amount: Decimal | None = None
    t_win_lose: Decimal | None = None


class ReportThirdGameUpdateInternal(ReportThirdGameUpdate):
    pass


class ReportThirdGameDelete(BaseModel):
    pass
