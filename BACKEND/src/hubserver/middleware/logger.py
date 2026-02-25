import uuid

import structlog
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class LoggerMiddleware:
    """Pure ASGI middleware for request logging.

    Uses ASGI protocol directly instead of BaseHTTPMiddleware
    to avoid blocking server shutdown.
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        request_id = headers.get(b"x-request-id", b"").decode() or str(uuid.uuid4())

        client = scope.get("client")
        client_host = client[0] if client else None

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            client_host=client_host,
            status_code=None,
            path=scope.get("path", ""),
            method=scope.get("method", ""),
        )

        async def send_with_request_id(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                status_code = message.get("status", 0)
                structlog.contextvars.bind_contextvars(status_code=status_code)
                headers.append((b"x-request-id", request_id.encode()))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_request_id)
