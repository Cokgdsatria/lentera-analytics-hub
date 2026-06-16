from fastapi import APIRouter

from app.schemas.inference import PredictionRequest, PredictionResponse
from app.services.inference import get_inference_service


router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    prediction = get_inference_service().predict(
        description=payload.description,
        category=payload.category,
    )
    return PredictionResponse(
        urgency=prediction.urgency,
        sentiment=prediction.sentiment,
        predicted_category=prediction.predicted_category,
        confidence=prediction.confidence,
        provider=prediction.provider,
        version=prediction.version,
        latency_ms=prediction.latency_ms,
        reasons=prediction.reasons,
    )
