from fastcrud import FastCRUD

from .model import ReportFunds, ReportLottery, ReportThirdGame
from .schema import (
    ReportFundsCreateInternal,
    ReportFundsDelete,
    ReportFundsRead,
    ReportFundsUpdate,
    ReportFundsUpdateInternal,
    ReportLotteryCreateInternal,
    ReportLotteryDelete,
    ReportLotteryRead,
    ReportLotteryUpdate,
    ReportLotteryUpdateInternal,
    ReportThirdGameCreateInternal,
    ReportThirdGameDelete,
    ReportThirdGameRead,
    ReportThirdGameUpdate,
    ReportThirdGameUpdateInternal,
)

CRUDReportLottery = FastCRUD[
    ReportLottery,
    ReportLotteryCreateInternal,
    ReportLotteryUpdate,
    ReportLotteryUpdateInternal,
    ReportLotteryDelete,
    ReportLotteryRead,
]
crud_report_lottery = CRUDReportLottery(ReportLottery)

CRUDReportFunds = FastCRUD[
    ReportFunds,
    ReportFundsCreateInternal,
    ReportFundsUpdate,
    ReportFundsUpdateInternal,
    ReportFundsDelete,
    ReportFundsRead,
]
crud_report_funds = CRUDReportFunds(ReportFunds)

CRUDReportThirdGame = FastCRUD[
    ReportThirdGame,
    ReportThirdGameCreateInternal,
    ReportThirdGameUpdate,
    ReportThirdGameUpdateInternal,
    ReportThirdGameDelete,
    ReportThirdGameRead,
]
crud_report_third_game = CRUDReportThirdGame(ReportThirdGame)
