from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import joblib
import numpy as np
import uvicorn
from green_score import calculate_green_score, estimate_co2
from optimizer import GreenOptimizer
import os

app = FastAPI(title="AI-Green-Impact-Analyzer API", version="1.0.0")

# Load model and scaler
model = joblib.load('../models/best_model.pkl')
scaler = joblib.load('../models/scaler.pkl')
optimizer = GreenOptimizer()

class PredictionRequest(BaseModel):
    features: List[float]  # 29 features in order from preprocessing

class OptimizationRequest(BaseModel):
    base_features: List[float]
    scenarios: Dict[str, List[List[float]]]  # scenario: [[idx, delta], ...]

@app.post("/predict")
async def predict_energy(request: PredictionRequest):
    try:
        features_scaled = scaler.transform(np.array(request.features).reshape(1, -1))
        pred = model.predict(features_scaled)[0]
        co2 = estimate_co2(pred)
        return {"predicted_consumption_kwh": float(pred), "co2_kg": float(co2)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/green_score")
async def green_score(actual: List[float], predicted: List[float]):
    score = calculate_green_score(np.array(actual), np.array(predicted))
    return {"green_score": float(score)}

@app.post("/optimize")
async def optimize(request: OptimizationRequest):
    try:
        base_scaled = scaler.transform(np.array(request.base_features).reshape(1, -1)).flatten()
        results = optimizer.simulate_optimization(base_scaled, request.scenarios)
        return {"scenarios": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
async def root():
    return {"message": "AI-Green-Impact-Analyzer API ready. Use /docs for interactive docs."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
