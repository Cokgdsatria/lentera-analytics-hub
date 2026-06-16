from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ComplaintRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    created_at: datetime
    updated_at: datetime
    is_anonymous: bool
    first_name: str | None
    last_name: str | None
    email: str | None
    company_name: str
    category: str
    description: str
    evidence_filename: str | None
    evidence_content_type: str | None
    status: str
    urgency: str
    sentiment: str
    predicted_category: str
    confidence: float
    inference_provider: str
    inference_version: str
    inference_latency_ms: float
    resolution_notes: str | None
    resolved_at: datetime | None


class ComplaintListItem(BaseModel):
    id: str
    date: str
    customer: str
    email: str
    company_name: str
    category: str
    urgency: str
    status: str
    sentiment: str
    description: str


class ComplaintListResponse(BaseModel):
    items: list[ComplaintListItem]
    total: int


class ComplaintUpdate(BaseModel):
    status: str | None = None
    resolution_notes: str | None = None
