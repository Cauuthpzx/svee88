"""Model registry — import all models so Alembic can discover them."""

# Core
from ..core.db.token_blacklist import TokenBlacklist  # noqa: F401

# Features
from .user.model import User  # noqa: F401
from .post.model import Post  # noqa: F401
from .tier.model import Tier, RateLimit  # noqa: F401

# Sync
from .sync.model import SyncMetadata  # noqa: F401
from .sync.member.model import Member  # noqa: F401
from .sync.bet.model import BetOrder, BetLottery  # noqa: F401
from .sync.finance.model import DepositWithdrawal  # noqa: F401
from .sync.report.model import ReportLottery, ReportFunds, ReportThirdGame  # noqa: F401
from .sync.config.model import LotterySeries, LotteryGame, BankList, InviteList  # noqa: F401
from .sync.account.model import Agent  # noqa: F401
