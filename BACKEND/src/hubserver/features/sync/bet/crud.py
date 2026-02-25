from fastcrud import FastCRUD

from .model import BetLottery, BetOrder
from .schema import (
    BetLotteryCreateInternal,
    BetLotteryDelete,
    BetLotteryRead,
    BetLotteryUpdate,
    BetLotteryUpdateInternal,
    BetOrderCreateInternal,
    BetOrderDelete,
    BetOrderRead,
    BetOrderUpdate,
    BetOrderUpdateInternal,
)

CRUDBetOrder = FastCRUD[
    BetOrder, BetOrderCreateInternal, BetOrderUpdate, BetOrderUpdateInternal, BetOrderDelete, BetOrderRead
]
crud_bet_orders = CRUDBetOrder(BetOrder)

CRUDBetLottery = FastCRUD[
    BetLottery, BetLotteryCreateInternal, BetLotteryUpdate, BetLotteryUpdateInternal, BetLotteryDelete, BetLotteryRead
]
crud_bet_lottery = CRUDBetLottery(BetLottery)
