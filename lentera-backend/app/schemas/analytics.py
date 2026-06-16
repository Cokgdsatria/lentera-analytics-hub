from app.schemas.complaint import ComplaintListItem
from pydantic import BaseModel


class MetricValue(BaseModel):
    name: str
    value: int


class TrendPoint(BaseModel):
    date: str
    count: int


class AnalyticsSummary(BaseModel):
    total_complaints: int
    pending_review: int
    in_progress: int
    resolved: int
    high_urgency: int
    urgency_distribution: list[MetricValue]
    category_distribution: list[MetricValue]
    sentiment_distribution: list[MetricValue]
    daily_trend: list[TrendPoint]
    recent_urgent: list[ComplaintListItem]
