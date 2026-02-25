from fastcrud import FastCRUD

from ..schemas import TokenBlacklistCreate, TokenBlacklistRead, TokenBlacklistUpdate
from .token_blacklist import TokenBlacklist

CRUDTokenBlacklist = FastCRUD[
    TokenBlacklist,
    TokenBlacklistCreate,
    TokenBlacklistUpdate,
    TokenBlacklistUpdate,
    TokenBlacklistUpdate,
    TokenBlacklistRead,
]
crud_token_blacklist = CRUDTokenBlacklist(TokenBlacklist)
