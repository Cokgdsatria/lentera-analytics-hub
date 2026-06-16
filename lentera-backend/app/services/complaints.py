from datetime import datetime

from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintListItem


def reporter_name(complaint: Complaint) -> str:
    if complaint.is_anonymous:
        return "Anonymous"
    name = " ".join(
        part for part in [complaint.first_name, complaint.last_name] if part
    ).strip()
    return name or "Unknown Reporter"


def reporter_email(complaint: Complaint) -> str:
    if complaint.is_anonymous:
        return "anonymous@protected.local"
    return complaint.email or "-"


def format_date(value: datetime) -> str:
    return value.strftime("%b %d, %Y")


def to_list_item(complaint: Complaint) -> ComplaintListItem:
    return ComplaintListItem(
        id=complaint.public_id or f"CMP-{complaint.id:06d}",
        date=format_date(complaint.created_at),
        customer=reporter_name(complaint),
        email=reporter_email(complaint),
        company_name=complaint.company_name,
        category=complaint.predicted_category or complaint.category,
        urgency=complaint.urgency,
        status=complaint.status,
        sentiment=complaint.sentiment,
        description=complaint.description,
    )
