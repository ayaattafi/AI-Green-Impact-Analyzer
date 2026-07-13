import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import ALLOWED_ORIGINS, API_KEY
from app.registry import registry
from app.routers import analytics, predict

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("greenly-ml")

app = FastAPI(
    title="GREENLY ML Service",
    description="Serves trained regression models (carbon, water, energy, food, waste, electronics) "
                "and lightweight trend forecasting for the GREENLY sustainability app.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    logger.info("%s %s -> %s (%.1fms)", request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.middleware("http")
async def require_api_key(request: Request, call_next):
    if API_KEY and request.url.path not in ("/health", "/docs", "/openapi.json") \
            and request.headers.get("x-api-key") != API_KEY:
        return JSONResponse(status_code=401, content={"detail": "Missing or invalid API key."})
    return await call_next(request)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


app.include_router(predict.router)
app.include_router(analytics.router)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "modelsLoaded": sorted(registry.pipelines.keys()),
        "expectedCategories": sorted(["carbon", "water", "energy", "food", "waste", "electronics"]),
    }
