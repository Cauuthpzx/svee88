import asyncio

import structlog
from sqlalchemy import select

from ..core.config import config
from ..core.db.database import AsyncSession, local_session
from ..features.tier.model import Tier

logger = structlog.get_logger(__name__)


async def create_first_tier(session: AsyncSession) -> None:
    try:
        tier_name = config("TIER_NAME", default="free")

        query = select(Tier).where(Tier.name == tier_name)
        result = await session.execute(query)
        tier = result.scalar_one_or_none()

        if tier is None:
            session.add(Tier(name=tier_name))
            await session.commit()
            logger.info("Đã tạo thành công gói dịch vụ '%s'.", tier_name)

        else:
            logger.info("Gói dịch vụ '%s' đã tồn tại.", tier_name)

    except Exception:
        logger.exception("Lỗi khi tạo gói dịch vụ")


async def main():
    async with local_session() as session:
        await create_first_tier(session)


if __name__ == "__main__":
    asyncio.run(main())
