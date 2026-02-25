"""Global exception classes and handlers for standardized API responses.

All API responses follow the format:
    {"code": <int>, "message": <str>, "data": <any|null>, "errors": <list>}
"""

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(self, status_code: int = 500, message: str = "Internal error", errors: list | None = None):
        self.status_code = status_code
        self.message = message
        self.errors = errors or []
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(status_code=404, message=message)


class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed", errors: list | None = None):
        super().__init__(status_code=422, message=message, errors=errors)


class AuthError(AppException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(status_code=401, message=message)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(status_code=403, message=message)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all global exception handlers on the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(_request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "code": exc.status_code,
                "message": exc.message,
                "data": None,
                "errors": exc.errors,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_request, exc: RequestValidationError):
        errors = []
        for e in exc.errors():
            loc = e.get("loc", [])
            field = str(loc[-1]) if loc else "unknown"
            errors.append({"field": field, "message": e.get("msg", "")})
        return JSONResponse(
            status_code=422,
            content={
                "code": 422,
                "message": "Validation failed",
                "data": None,
                "errors": errors,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "code": exc.status_code,
                "message": str(exc.detail),
                "data": None,
                "errors": [],
            },
        )
