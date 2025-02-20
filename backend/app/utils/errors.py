from fastapi import HTTPException
from typing import Optional, Any, Dict

class TokenXError(HTTPException):
    """Base error class for TokenX application"""
    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "error_code": error_code,
                "message": message,
                "details": details or {}
            }
        )

class ValidationError(TokenXError):
    """Validation error"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=422,
            message=message,
            error_code="VALIDATION_ERROR",
            details=details
        )

class NotFoundError(TokenXError):
    """Resource not found error"""
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            status_code=404,
            message=f"{resource} with ID {resource_id} not found",
            error_code="NOT_FOUND",
            details={"resource": resource, "id": resource_id}
        )

class BlockchainError(TokenXError):
    """Blockchain interaction error"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=503,
            message=message,
            error_code="BLOCKCHAIN_ERROR",
            details=details
        )

class AuthorizationError(TokenXError):
    """Authorization error"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            status_code=401,
            message=message,
            error_code="UNAUTHORIZED"
        )

class ForbiddenError(TokenXError):
    """Forbidden error"""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(
            status_code=403,
            message=message,
            error_code="FORBIDDEN"
        ) 