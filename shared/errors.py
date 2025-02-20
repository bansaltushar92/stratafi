from fastapi import HTTPException

class TokenXError(HTTPException):
    def __init__(self, status_code: int, message: str, error_code: str, details: dict = None):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(status_code=status_code, detail={'message': message, 'error_code': error_code, 'details': self.details})

class ValidationError(TokenXError):
    def __init__(self, message: str = "Validation error", details: dict = None):
        super().__init__(422, message, "VALIDATION_ERROR", details)

class NotFoundError(TokenXError):
    def __init__(self, message: str = "Resource not found", details: dict = None):
        super().__init__(404, message, "NOT_FOUND_ERROR", details)

class BlockchainError(TokenXError):
    def __init__(self, message: str = "Blockchain error", details: dict = None):
        super().__init__(503, message, "BLOCKCHAIN_ERROR", details)

class AuthorizationError(TokenXError):
    def __init__(self, message: str = "Unauthorized", details: dict = None):
        super().__init__(401, message, "AUTHORIZATION_ERROR", details)

class ForbiddenError(TokenXError):
    def __init__(self, message: str = "Forbidden", details: dict = None):
        super().__init__(403, message, "FORBIDDEN_ERROR", details) 