"""
Loads the trained model artifacts once at process startup and exposes a
single `predict()` entry point used by the API routes.
"""
import bisect
import json
from pathlib import Path

import joblib
import pandas as pd

from app.config import MODELS_DIR

TARGET_UNIT = {
    "carbon": ("co2e_kg", "kg CO2e"),
    "energy": ("co2e_kg", "kg CO2e"),
    "electronics": ("co2e_kg", "kg CO2e"),
    "food": ("co2e_kg", "kg CO2e"),
    "waste": ("co2e_kg", "kg CO2e"),
    "water": ("waterLiters", "liters"),
}


class ModelRegistry:
    def __init__(self, models_dir: Path):
        self.models_dir = models_dir
        self.pipelines: dict[str, object] = {}
        self.metrics: dict = {}
        self.distributions: dict = {}
        self._load()

    def _load(self) -> None:
        metrics_path = self.models_dir / "metrics.json"
        distributions_path = self.models_dir / "distributions.json"
        if metrics_path.exists():
            self.metrics = json.loads(metrics_path.read_text())
        if distributions_path.exists():
            self.distributions = json.loads(distributions_path.read_text())

        for category in TARGET_UNIT:
            model_path = self.models_dir / f"{category}_model.joblib"
            if model_path.exists():
                self.pipelines[category] = joblib.load(model_path)

    def is_ready(self, category: str) -> bool:
        return category in self.pipelines

    def percentile_rank(self, category: str, value: float) -> float:
        sample = self.distributions.get(category, {}).get("sorted_sample")
        if not sample:
            return 50.0
        idx = bisect.bisect_left(sample, value)
        return round(100.0 * idx / len(sample), 1)

    def predict(self, category: str, input_dict: dict) -> dict:
        pipeline = self.pipelines[category]
        info = self.metrics[category]
        target, unit = TARGET_UNIT[category]

        feature_cols = info["categorical_features"] + info["numeric_features"]
        row = pd.DataFrame([{k: input_dict[k] for k in feature_cols}])
        prediction = float(pipeline.predict(row)[0])
        prediction = max(0.0, prediction)

        percentile = self.percentile_rank(category, prediction)
        green_score = int(round(100 - percentile))

        best_algo = info["best_algorithm"]
        model_r2 = info["algorithms"][best_algo]["r2"]
        confidence = round(max(0.0, min(0.99, model_r2)), 3)

        return {
            "category": category,
            "prediction": round(prediction, 3),
            "target": target,
            "unit": unit,
            "greenScore": max(0, min(100, green_score)),
            "confidence": confidence,
            "modelUsed": best_algo,
            "percentileRank": percentile,
            "featureContributions": info["feature_importance"],
        }


registry = ModelRegistry(MODELS_DIR)
