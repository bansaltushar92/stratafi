from enum import Enum

class TokenStatus(str, Enum):
    """Token lifecycle status"""
    PENDING = "pending"
    FUNDRAISING = "fundraising"
    COMPLETED = "completed"
    TRADING = "trading"
    FAILED = "failed"

class TransactionType(str, Enum):
    """Transaction types"""
    BUY = "buy"
    SELL = "sell"

class TransactionStatus(str, Enum):
    """Transaction status"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class UserRole(str, Enum):
    """User roles"""
    USER = "user"
    ASSET_MANAGER = "asset_manager"
    ADMIN = "admin" 