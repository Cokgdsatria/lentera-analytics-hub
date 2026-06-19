from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    description: str = Field(min_length=3)
    category: str | None = None


class PredictionResponse(BaseModel):
    urgency: str
    sentiment: str
    predicted_category: str
    confidence: float
    provider: str
    version: str
    latency_ms: float
    reasons: list[str] = Field(default_factory=list)
