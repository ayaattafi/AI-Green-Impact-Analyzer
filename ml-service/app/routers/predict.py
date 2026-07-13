from fastapi import APIRouter, HTTPException

from app.registry import registry
from app.schemas import (
    CarbonInput, ElectronicsInput, EnergyInput, FoodInput, PredictionResponse,
    WasteInput, WaterInput,
)

router = APIRouter(prefix="/api/predict", tags=["predict"])


def _predict_or_503(category: str, payload: dict) -> PredictionResponse:
    if not registry.is_ready(category):
        raise HTTPException(status_code=503, detail=f"Model for '{category}' is not loaded. Run scripts/train.py.")
    return PredictionResponse(**registry.predict(category, payload))


@router.post("/carbon", response_model=PredictionResponse)
def predict_carbon(payload: CarbonInput) -> PredictionResponse:
    return _predict_or_503("carbon", payload.model_dump())


@router.post("/water", response_model=PredictionResponse)
def predict_water(payload: WaterInput) -> PredictionResponse:
    return _predict_or_503("water", payload.model_dump())


@router.post("/energy", response_model=PredictionResponse)
def predict_energy(payload: EnergyInput) -> PredictionResponse:
    return _predict_or_503("energy", payload.model_dump())


@router.post("/food", response_model=PredictionResponse)
def predict_food(payload: FoodInput) -> PredictionResponse:
    return _predict_or_503("food", payload.model_dump())


@router.post("/waste", response_model=PredictionResponse)
def predict_waste(payload: WasteInput) -> PredictionResponse:
    return _predict_or_503("waste", payload.model_dump())


@router.post("/electronics", response_model=PredictionResponse)
def predict_electronics(payload: ElectronicsInput) -> PredictionResponse:
    return _predict_or_503("electronics", payload.model_dump())
