# GREENLY ML Service

FastAPI microservice that trains and serves the regression models behind
GREENLY's six environmental-impact calculators, replacing the frontend's old
static emission-factor formulas.

See [`DATASETS.md`](./DATASETS.md) for exactly what data trains these models
and why.

## Local development

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

python scripts/download_datasets.py   # fetch public source data (~15MB, no auth)
python scripts/prepare_datasets.py    # clean/engineer -> data/processed/*.csv
python scripts/train.py               # train + compare 5 algorithms, save best per category

uvicorn app.main:app --reload --port 8000
```

Then visit `http://localhost:8000/docs` for interactive API docs.

## What gets trained

For each of `carbon`, `water`, `energy`, `food`, `waste`, `electronics`, five
algorithms are trained and compared on an 80/20 split: **Random Forest,
Gradient Boosting, XGBoost, LightGBM, CatBoost**. The best model per category
(by test R²) is saved to `models/{category}_model.joblib`; the full
comparison table (MAE/RMSE/R² for all 5 algorithms x 6 categories) is saved
to `models/metrics.json` and served at `GET /api/models/metrics` so the
frontend's AI Analytics page can show genuine model performance instead of a
hardcoded accuracy badge.

"Green Score" is derived at inference time as the predicted value's
percentile rank against the model's own training-target distribution
(lower footprint -> higher score) — a data-driven scoring methodology
computed by `app/registry.py`, not a hand-tuned constant formula.

## API

| Endpoint | Description |
|---|---|
| `POST /api/predict/{carbon\|water\|energy\|food\|waste\|electronics}` | Predict impact + green score + confidence + feature importance for one calculator submission |
| `GET /api/models/metrics` | Full 5-algorithm x 6-category comparison table |
| `GET /api/models/{category}/distribution` | Target-value percentiles for a category |
| `POST /api/forecast` | Fits a trend line + confidence band over a user's own historical analyses (no fake data — returns low confidence if given few points) |
| `GET /health` | Liveness + which category models are loaded |

Set `ML_API_KEY` to require an `X-API-Key` header on every request except
`/health`; set `ALLOWED_ORIGINS` (comma-separated) for CORS.

## Retraining

Datasets and models are fully reproducible: `data/raw/` and
`data/processed/` are gitignored (regenerate via the two scripts above);
`models/*.joblib` + `metrics.json` + `distributions.json` are committed so
the service runs out of the box without requiring a training step in CI/CD.
