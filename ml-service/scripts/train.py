"""
Trains and compares 5 regression algorithms per category (Random Forest,
Gradient Boosting, XGBoost, LightGBM, CatBoost), evaluates each on a held-out
test split (MAE, RMSE, R^2), and persists the best-performing model per
category to models/{category}_model.joblib.

Also writes:
  - models/metrics.json           full comparison table for every algorithm/category
  - models/feature_importance.json winning model's feature importances per category
  - models/distributions.json      target-value percentiles per category, used to
                                    derive a data-driven Green Score at inference time

Run: python scripts/train.py
"""
import json
import time
from pathlib import Path

import numpy as np
import pandas as pd
from catboost import CatBoostRegressor
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor
import joblib

PROCESSED = Path(__file__).resolve().parent.parent / "data" / "processed"
MODELS = Path(__file__).resolve().parent.parent / "models"
MODELS.mkdir(parents=True, exist_ok=True)

# category -> (target column, categorical feature columns, numeric feature columns)
CATEGORY_SPEC = {
    "carbon": ("co2e_kg", ["vehicleType", "fuelType"], ["distance", "fuelConsumption", "passengers"]),
    "energy": ("co2e_kg", ["heatingType"], ["electricityKwh", "heatingKwh", "renewablePercent", "avgOutdoorTempC"]),
    "electronics": ("co2e_kg", ["deviceType"], ["usageHours", "powerWatts", "standbyHours", "devicesCount"]),
    "water": ("waterLiters", [], ["showerMinutes", "laundryLoads", "dishwasherLoads", "toiletFlushes", "tapMinutes"]),
    "food": ("co2e_kg", [], ["meatMeals", "dairyServings", "plantMeals", "foodWasteKg"]),
    "waste": ("co2e_kg", [], ["plasticKg", "paperKg", "organicKg", "glassKg", "recycledPercent"]),
}

ALGORITHMS = {
    "random_forest": lambda: RandomForestRegressor(n_estimators=300, max_depth=14, n_jobs=-1, random_state=42),
    "gradient_boosting": lambda: GradientBoostingRegressor(n_estimators=300, max_depth=4, learning_rate=0.05, random_state=42),
    "xgboost": lambda: XGBRegressor(n_estimators=400, max_depth=6, learning_rate=0.05, n_jobs=-1, random_state=42, verbosity=0),
    "lightgbm": lambda: LGBMRegressor(n_estimators=400, max_depth=-1, learning_rate=0.05, random_state=42, verbosity=-1),
    "catboost": lambda: CatBoostRegressor(iterations=400, depth=6, learning_rate=0.05, random_state=42, verbose=False),
}


def build_preprocessor(categorical: list[str], numeric: list[str]) -> ColumnTransformer:
    return ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", "passthrough", numeric),
    ])


def get_feature_names(preprocessor: ColumnTransformer, categorical: list[str], numeric: list[str]) -> list[str]:
    names: list[str] = []
    if categorical:
        ohe: OneHotEncoder = preprocessor.named_transformers_["cat"]
        names.extend(ohe.get_feature_names_out(categorical).tolist())
    names.extend(numeric)
    return names


def train_category(category: str, target: str, categorical: list[str], numeric: list[str]) -> dict:
    df = pd.read_csv(PROCESSED / f"{category}.csv")
    X = df[categorical + numeric]
    y = df[target]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    results = {}
    best_name, best_score, best_pipeline, best_preds = None, -np.inf, None, None

    for algo_name, make_model in ALGORITHMS.items():
        preprocessor = build_preprocessor(categorical, numeric)
        pipeline = Pipeline([("prep", preprocessor), ("model", make_model())])

        t0 = time.time()
        pipeline.fit(X_train, y_train)
        train_seconds = time.time() - t0

        preds = pipeline.predict(X_test)
        mae = float(mean_absolute_error(y_test, preds))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        r2 = float(r2_score(y_test, preds))

        results[algo_name] = {"mae": round(mae, 4), "rmse": round(rmse, 4), "r2": round(r2, 4),
                               "train_seconds": round(train_seconds, 2)}
        print(f"  [{category}] {algo_name:18s} MAE={mae:8.3f}  RMSE={rmse:8.3f}  R2={r2:.4f}")

        if r2 > best_score:
            best_name, best_score, best_pipeline, best_preds = algo_name, r2, pipeline, preds

    # Persist the winning pipeline (preprocessing + model together).
    joblib.dump(best_pipeline, MODELS / f"{category}_model.joblib")

    # Feature importance for the winning model (tree-based models all expose
    # feature_importances_; CatBoost too).
    feature_names = get_feature_names(best_pipeline.named_steps["prep"], categorical, numeric)
    importances = best_pipeline.named_steps["model"].feature_importances_
    importance_map: dict[str, float] = {}
    for fname, imp in zip(feature_names, importances):
        # Roll one-hot columns like "vehicleType_car" back up to "vehicleType"
        base = fname
        for c in categorical:
            if fname.startswith(c + "_"):
                base = c
                break
        importance_map[base] = importance_map.get(base, 0.0) + float(imp)
    total = sum(importance_map.values()) or 1.0
    importance_map = {k: round(v / total, 4) for k, v in sorted(importance_map.items(), key=lambda kv: -kv[1])}

    return {
        "target": target,
        "categorical_features": categorical,
        "numeric_features": numeric,
        "best_algorithm": best_name,
        "algorithms": results,
        "feature_importance": importance_map,
        "target_distribution": {
            "p10": float(np.percentile(y, 10)), "p25": float(np.percentile(y, 25)),
            "p50": float(np.percentile(y, 50)), "p75": float(np.percentile(y, 75)),
            "p90": float(np.percentile(y, 90)), "mean": float(y.mean()), "std": float(y.std()),
            "sorted_sample": sorted(y.sample(min(2000, len(y)), random_state=42).tolist()),
        },
    }


def main() -> None:
    all_metrics = {}
    for category, (target, categorical, numeric) in CATEGORY_SPEC.items():
        print(f"\n=== Training category: {category} ===")
        all_metrics[category] = train_category(category, target, categorical, numeric)

    metrics_out = {
        cat: {k: v for k, v in info.items() if k != "target_distribution"}
        for cat, info in all_metrics.items()
    }
    (MODELS / "metrics.json").write_text(json.dumps(metrics_out, indent=2))

    distributions = {cat: info["target_distribution"] for cat, info in all_metrics.items()}
    (MODELS / "distributions.json").write_text(json.dumps(distributions, indent=2))

    print("\n=== Best model per category ===")
    for cat, info in all_metrics.items():
        best = info["best_algorithm"]
        m = info["algorithms"][best]
        print(f"  {cat:12s} -> {best:18s} (R2={m['r2']:.4f}, MAE={m['mae']:.3f}, RMSE={m['rmse']:.3f})")
    print(f"\nSaved models + metrics.json + distributions.json to {MODELS}")


if __name__ == "__main__":
    main()
