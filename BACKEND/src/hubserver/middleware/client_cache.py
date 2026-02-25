from starlette.types import ASGIApp, Message, Receive, Scope, Send


class ClientCacheMiddleware:
    """Pure ASGI middleware for client-side cache headers.

    Uses ASGI protocol directly instead of BaseHTTPMiddleware
    to avoid blocking server shutdown.
    """

    def __init__(self, app: ASGIApp, max_age: int = 60) -> None:
        self.app = app
        self.max_age = max_age

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Skip cache headers for API endpoints — they return authenticated data
        path: str = scope.get("path", "")
        if path.startswith("/api/"):
            await self.app(scope, receive, send)
            return

        async def send_with_cache(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"cache-control", f"public, max-age={self.max_age}".encode()))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_cache)
