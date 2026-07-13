import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

# Comma-separated list of allowed CORS origins, e.g.
# "http://localhost:5173,https://app.greenly.example"
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

# Shared-secret header required on every request, set the same value on the
# frontend's VITE_ML_API_KEY. Optional in local dev (unset -> no check).
API_KEY = os.getenv("ML_API_KEY", "")
