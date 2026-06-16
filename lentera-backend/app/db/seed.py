from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.user import User


def seed_admin_user(db: Session) -> None:
    settings = get_settings()
    email = settings.admin_email.lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        return

    db.add(
        User(
            email=email,
            hashed_password=get_password_hash(settings.admin_password),
            role="admin",
            is_active=True,
        )
    )
    db.commit()
