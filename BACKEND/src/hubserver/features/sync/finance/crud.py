from fastcrud import FastCRUD

from .model import DepositWithdrawal
from .schema import (
    DepositWithdrawalCreateInternal,
    DepositWithdrawalDelete,
    DepositWithdrawalRead,
    DepositWithdrawalUpdate,
    DepositWithdrawalUpdateInternal,
)

CRUDDepositWithdrawal = FastCRUD[
    DepositWithdrawal,
    DepositWithdrawalCreateInternal,
    DepositWithdrawalUpdate,
    DepositWithdrawalUpdateInternal,
    DepositWithdrawalDelete,
    DepositWithdrawalRead,
]
crud_deposit_withdrawal = CRUDDepositWithdrawal(DepositWithdrawal)
