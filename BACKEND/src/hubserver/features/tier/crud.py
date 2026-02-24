from fastcrud import FastCRUD

from .model import RateLimit, Tier
from .schema import (
    RateLimitCreateInternal,
    RateLimitDelete,
    RateLimitRead,
    RateLimitUpdate,
    RateLimitUpdateInternal,
    TierCreateInternal,
    TierDelete,
    TierRead,
    TierUpdate,
    TierUpdateInternal,
)

CRUDTier = FastCRUD[Tier, TierCreateInternal, TierUpdate, TierUpdateInternal, TierDelete, TierRead]
crud_tiers = CRUDTier(Tier)

CRUDRateLimit = FastCRUD[
    RateLimit, RateLimitCreateInternal, RateLimitUpdate, RateLimitUpdateInternal, RateLimitDelete, RateLimitRead
]
crud_rate_limits = CRUDRateLimit(RateLimit)
