from enum import Enum

class TokenStatus(Enum):
    PENDING = 'PENDING'
    FUNDRAISING = 'FUNDRAISING'
    COMPLETED = 'COMPLETED'
    TRADING = 'TRADING'
    FAILED = 'FAILED'

class TransactionType(Enum):
    BUY = 'BUY'
    SELL = 'SELL'

class TransactionStatus(Enum):
    PENDING = 'PENDING'
    COMPLETED = 'COMPLETED'
    FAILED = 'FAILED'

class UserRole(Enum):
    USER = 'USER'
    ASSET_MANAGER = 'ASSET_MANAGER'
    ADMIN = 'ADMIN' 