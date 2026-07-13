from fastapi import APIRouter, HTTPException

from app.forecasting import forecast
from app.registry import registry
from app.schemas import ForecastRequest, ForecastResponse

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/models/metrics")
def get_metrics() -> dict:
    """Full algorithm-comparison table (MAE/RMSE/R2) for every category, used
    by the AI Analytics page to show real model performance instead of a
    hardcoded 'v2.4 96% accuracy' badge."""
    if not registry.metrics:
        raise HTTPException(status_code=503, detail="Metrics not available. Run scripts/train.py.")
    return registry.metrics


@router.get("/models/{category}/distribution")
def get_distribution(category: str) -> dict:
    dist = registry.distributions.get(category)
    if not dist:
        raise HTTPException(status_code=404, detail=f"No distribution for category '{category}'.")
    return {k: v for k, v in dist.items() if k != "sorted_sample"}


@router.post("/forecast", response_model=ForecastResponse)
def post_forecast(payload: ForecastRequest) -> ForecastResponse:
    if not payload.points:
        raise HTTPException(status_code=400, detail="At least one historical point is required.")
    return ForecastResponse(**forecast(payload.points, payload.periodsAhead))
