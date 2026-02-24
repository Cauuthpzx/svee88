import asyncio
import logging
import sys
from typing import Any

import structlog
from arq.worker import Worker

if sys.platform != "win32":
    import uvloop
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())


# -------- tác vụ nền --------
async def sample_background_task(ctx: Worker, name: str) -> str:
    await asyncio.sleep(5)
    return f"Tác vụ {name} đã hoàn thành!"


# -------- hàm cơ bản --------
async def startup(ctx: Worker) -> None:
    logging.info("Worker đã khởi động")


async def shutdown(ctx: Worker) -> None:
    logging.info("Worker đã dừng")


async def on_job_start(ctx: dict[str, Any]) -> None:
    structlog.contextvars.bind_contextvars(job_id=ctx["job_id"])
    logging.info("Công việc đã bắt đầu")


async def on_job_end(ctx: dict[str, Any]) -> None:
    logging.info("Công việc đã hoàn thành")
    structlog.contextvars.clear_contextvars()
