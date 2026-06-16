from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    public_id: Mapped[str | None] = mapped_column(
        String(24),
        unique=True,
        index=True,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
    )

    is_anonymous: Mapped[bool] = mapped_column(default=False, nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    evidence_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    evidence_content_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    evidence_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    status: Mapped[str] = mapped_column(String(40), nullable=False, default="Pending")
    urgency: Mapped[str] = mapped_column(String(40), nullable=False, default="Low")
    sentiment: Mapped[str] = mapped_column(String(40), nullable=False, default="Neutral")
    predicted_category: Mapped[str] = mapped_column(String(120), nullable=False, default="Other")
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    inference_provider: Mapped[str] = mapped_column(String(80), nullable=False, default="rules")
    inference_version: Mapped[str] = mapped_column(String(80), nullable=False, default="rules-v1")
    inference_latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
