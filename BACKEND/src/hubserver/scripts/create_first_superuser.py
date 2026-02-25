import asyncio

import structlog
from sqlalchemy import select

from ..core.config import settings
from ..core.db.database import AsyncSession, local_session
from ..core.security import get_password_hash
from ..features.user.model import User

logger = structlog.get_logger(__name__)


async def create_first_user(session: AsyncSession) -> None:
    try:
        name = settings.ADMIN_NAME
        email = settings.ADMIN_EMAIL
        username = settings.ADMIN_USERNAME
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)

        query = select(User).filter_by(email=email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            new_user = User(
                name=name,
                email=email,
                username=username,
                hashed_password=hashed_password,
                is_superuser=True,
            )
            session.add(new_user)
            await session.commit()
            logger.info("Đã tạo thành công tài khoản quản trị viên %s.", username)

        else:
            logger.info("Tài khoản quản trị viên %s đã tồn tại.", username)

    except Exception:
        logger.exception("Lỗi khi tạo tài khoản quản trị viên")


async def main():
    async with local_session() as session:
        await create_first_user(session)


if __name__ == "__main__":
    asyncio.run(main())
