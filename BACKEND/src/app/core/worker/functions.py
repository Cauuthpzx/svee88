import asyncio
import logging
import sys
from typing import Any

import structlog
from arq.worker import Worker

if sys.platform != "win32":
    import uvloop
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())


# -------- background tasks --------
async def sample_background_task(ctx: Worker, name: str) -> str:
    await asyncio.sleep(5)
    return f"Task {name} completed!"


# -------- lifecycle hooks --------
async def startup(ctx: Worker) -> None:
    logging.info("Worker started")


async def shutdown(ctx: Worker) -> None:
    logging.info("Worker stopped")


async def on_job_start(ctx: dict[str, Any]) -> None:
    structlog.contextvars.bind_contextvars(job_id=ctx["job_id"])
    logging.info("Job started")


async def on_job_end(ctx: dict[str, Any]) -> None:
    logging.info("Job completed")
    structlog.contextvars.clear_contextvars()
