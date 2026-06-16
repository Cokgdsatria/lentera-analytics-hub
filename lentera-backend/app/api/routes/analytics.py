from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary, MetricValue, TrendPoint
from app.services.complaints import to_list_item


router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AnalyticsSummary:
    total = db.scalar(select(func.count(Complaint.id))) or 0
    status_counts = _counts_by(db, Complaint.status)
    urgency_counts = _counts_by(db, Complaint.urgency)
    category_counts = _counts_by(db, Complaint.predicted_category)
    sentiment_counts = _counts_by(db, Complaint.sentiment)

    recent_urgent = db.scalars(
        select(Complaint)
        .where(Complaint.urgency.in_(["High", "Medium"]))
        .order_by(desc(Complaint.created_at))
        .limit(5)
    ).all()

    return AnalyticsSummary(
        total_complaints=total,
        pending_review=status_counts.get("Pending", 0),
        in_progress=status_counts.get("In Progress", 0),
        resolved=status_counts.get("Resolved", 0),
        high_urgency=urgency_counts.get("High", 0),
        urgency_distribution=_distribution(urgency_counts, ["High", "Medium", "Low"]),
        category_distribution=_distribution(category_counts),
        sentiment_distribution=_distribution(sentiment_counts, ["Negative", "Neutral", "Positive"]),
        daily_trend=_daily_trend(db),
        recent_urgent=[to_list_item(complaint) for complaint in recent_urgent],
    )


def _counts_by(db: Session, column) -> dict[str, int]:
    rows = db.execute(select(column, func.count(Complaint.id)).group_by(column)).all()
    return {str(name): int(count) for name, count in rows if name is not None}


def _distribution(counts: dict[str, int], preferred_order: list[str] | None = None) -> list[MetricValue]:
    if preferred_order is None:
        ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    else:
        ordered = [(name, counts.get(name, 0)) for name in preferred_order]
    return [MetricValue(name=name, value=value) for name, value in ordered]


def _daily_trend(db: Session, days: int = 30) -> list[TrendPoint]:
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=days - 1)
    rows = db.execute(
        select(func.date(Complaint.created_at), func.count(Complaint.id))
        .where(Complaint.created_at >= datetime.combine(start, datetime.min.time(), tzinfo=timezone.utc))
        .group_by(func.date(Complaint.created_at))
    ).all()
    counts = {str(day): int(count) for day, count in rows}
    return [
        TrendPoint(date=(start + timedelta(days=offset)).isoformat(), count=counts.get((start + timedelta(days=offset)).isoformat(), 0))
        for offset in range(days)
    ]
