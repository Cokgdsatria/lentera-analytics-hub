from fastapi import APIRouter

from app.api.routes import analytics, auth, complaints, inference


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["complaints"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(inference.router, prefix="/inference", tags=["inference"])
