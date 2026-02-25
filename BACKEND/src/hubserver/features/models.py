"""Model registry — import all models so Alembic can discover them."""

# Core
from ..core.db.token_blacklist import TokenBlacklist  # noqa: F401
from .sync.account.model import Agent  # noqa: F401
from .sync.bet.model import BetLottery, BetOrder  # noqa: F401
from .sync.config.model import BankList, InviteList, LotteryGame, LotterySeries  # noqa: F401
from .sync.finance.model import DepositWithdrawal  # noqa: F401
from .sync.member.model import Member  # noqa: F401

# Sync
from .sync.model import SyncMetadata  # noqa: F401
from .sync.report.model import ReportFunds, ReportLottery, ReportThirdGame  # noqa: F401
from .tier.model import RateLimit, Tier  # noqa: F401

# Features
from .user.model import User  # noqa: F401
