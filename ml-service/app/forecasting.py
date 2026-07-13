"""
Lightweight trend forecasting over a user's own saved analysis history.

This intentionally does NOT simulate fake seasonal noise. The ML service has
no access to the user's account history (that lives in Supabase, owned by
the frontend), so the frontend sends the user's own real data points and
this fits a simple, honest linear trend with a residual-based confidence
band. With few data points this is appropriately uncertain; the confidence
score reflects that (few points -> wide interval -> lower confidence),
rather than pretending a fixed "96% accuracy" regardless of input.
"""
import numpy as np

from app.schemas import ForecastPoint, ForecastResponsePoint


def forecast(points: list[ForecastPoint], periods_ahead: int) -> dict:
    values = np.array([p.value for p in points], dtype=float)
    n = len(values)

    if n < 2:
        flat = float(values[0]) if n == 1 else 0.0
        result_points = [
            ForecastResponsePoint(index=i, predicted=v, confidenceLow=v, confidenceHigh=v,
                                   isHistorical=True, actual=v)
            for i, v in enumerate(values)
        ]
        for i in range(periods_ahead):
            result_points.append(ForecastResponsePoint(
                index=n + i, predicted=flat, confidenceLow=flat * 0.7, confidenceHigh=flat * 1.3,
                isHistorical=False,
            ))
        return {
            "points": result_points, "trend": "stable", "trendPercent": 0.0,
            "modelConfidence": 0.2, "method": "insufficient_data_flat_projection",
        }

    x = np.arange(n)
    slope, intercept = np.polyfit(x, values, 1)
    fitted = slope * x + intercept
    residuals = values - fitted
    residual_std = float(np.std(residuals)) if n > 2 else float(np.std(values)) * 0.3

    result_points = []
    for i in range(n):
        result_points.append(ForecastResponsePoint(
            index=i, predicted=round(float(fitted[i]), 2),
            confidenceLow=round(float(fitted[i] - residual_std), 2),
            confidenceHigh=round(float(fitted[i] + residual_std), 2),
            isHistorical=True, actual=round(float(values[i]), 2),
        ))

    future_x = np.arange(n, n + periods_ahead)
    for i, fx in enumerate(future_x):
        pred = slope * fx + intercept
        # Widen the interval the further out we project - genuine
        # uncertainty growth, not a cosmetic effect.
        widen = residual_std * (1 + 0.15 * i)
        result_points.append(ForecastResponsePoint(
            index=int(fx), predicted=round(max(0.0, float(pred)), 2),
            confidenceLow=round(max(0.0, float(pred - widen)), 2),
            confidenceHigh=round(float(pred + widen), 2),
            isHistorical=False,
        ))

    mean_val = float(np.mean(values)) or 1.0
    trend_percent = round((slope * periods_ahead / mean_val) * 100, 1)
    trend = "stable"
    if trend_percent > 3:
        trend = "increasing"
    elif trend_percent < -3:
        trend = "decreasing"

    # Confidence grows with sample size and shrinks with relative noise -
    # a real (if simple) reliability signal instead of a fixed constant.
    r2 = 1 - (np.var(residuals) / np.var(values)) if np.var(values) > 0 else 0.0
    sample_factor = min(1.0, n / 12)
    model_confidence = round(max(0.05, min(0.95, 0.5 * max(0.0, r2) + 0.5 * sample_factor)), 3)

    return {
        "points": result_points, "trend": trend, "trendPercent": trend_percent,
        "modelConfidence": model_confidence, "method": "linear_trend_with_residual_band",
    }
