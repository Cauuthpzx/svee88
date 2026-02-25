from sqlalchemy.orm import Session
from uuid6 import uuid7

from src.hubserver.core.security import get_password_hash
from src.hubserver.features.user.model import User
from tests.conftest import fake


def create_user(db: Session, is_super_user: bool = False) -> User:
    _user = User(
        name=fake.name(),
        username=fake.user_name(),
        email=fake.email(),
        hashed_password=get_password_hash(fake.password()),
        profile_image_url=fake.image_url(),
        uuid=uuid7(),
        is_superuser=is_super_user,
    )

    db.add(_user)
    db.commit()
    db.refresh(_user)

    return _user
