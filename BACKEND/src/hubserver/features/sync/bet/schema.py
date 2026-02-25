from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

# --- BetOrder schemas ---

class BetOrderBase(BaseModel):
    id: int
    bet_time: datetime
    agent_id: int = 1
    serial_no: str
    cid: int
    platform_id: int
    uid: int
    game_name: str
    game_code: str
    bet_amount: int = 0
    turnover: int = 0
    prize: int = 0
    win_lose: int = 0
    platform_id_name: str
    c_name: str
    platform_username: str
    create_time: datetime
    update_time: datetime


class BetOrderRead(BetOrderBase):
    extra: str | None = None
    origin: str | None = None
    prizetime: datetime | None = None
    delete_time: int = 0


class BetOrderCreateInternal(BetOrderBase):
    extra: str | None = None
    origin: str | None = None
    prizetime: datetime | None = None
    delete_time: int = 0


class BetOrderUpdate(BaseModel):
    prize: int | None = None
    win_lose: int | None = None
    update_time: datetime | None = None


class BetOrderUpdateInternal(BetOrderUpdate):
    pass


class BetOrderDelete(BaseModel):
    pass


# --- BetLottery schemas ---

class BetLotteryBase(BaseModel):
    id: int
    create_time: datetime
    agent_id: int = 1
    serial_no: str
    uid: int
    issue: str
    issue_id: int
    lottery_id: int
    lottery_name: str
    play_id: int
    play_type_id: int
    odds_id: int
    odds: Decimal
    content: str
    count: int
    price: int
    money: int
    status: int = 0
    username: str
    update_time: datetime


class BetLotteryRead(BetLotteryBase):
    user_parent: int | None = None
    win_count: int = 0
    real_count: int = 0
    real_win_count: int = 0
    rebate: int = 0
    rebate_amount: int = 0
    result: int = 0
    prize: int = 0
    commission_status: int = 0
    source: int = 0
    prize_time: datetime | None = None
    ip: str | None = None
    is_tester: bool = False


class BetLotteryCreateInternal(BetLotteryBase):
    user_parent: int | None = None
    user_tree: dict | list | None = None
    bet_data_set: dict | None = None
    win_count: int = 0
    real_count: int = 0
    real_win_count: int = 0
    rebate: int = 0
    rebate_amount: int = 0
    result: int = 0
    prize: int = 0
    commission_status: int = 0
    source: int = 0
    prize_time: datetime | None = None
    ip: str | None = None
    is_tester: bool = False


class BetLotteryUpdate(BaseModel):
    status: int | None = None
    result: int | None = None
    prize: int | None = None
    update_time: datetime | None = None


class BetLotteryUpdateInternal(BetLotteryUpdate):
    pass


class BetLotteryDelete(BaseModel):
    pass
