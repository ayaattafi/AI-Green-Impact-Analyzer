import { logger } from '@/lib/logger';
import type { CalculatorCategory } from '@/types';

const ML_API_URL = (import.meta.env.VITE_ML_API_URL as string | undefined) ?? 'http://localhost:8000';

export class MlServiceError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'MlServiceError';
  }
}

export interface MlPrediction {
  category: CalculatorCategory;
  prediction: number;
  target: string;
  unit: string;
  greenScore: number;
  confidence: number;
  modelUsed: string;
  percentileRank: number;
  featureContributions: Record<string, number>;
}

export interface MlForecastPoint {
  index: number;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  isHistorical: boolean;
  actual: number | null;
}

export interface MlForecast {
  points: MlForecastPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercent: number;
  modelConfidence: number;
  method: string;
}

export interface ModelAlgorithmMetrics {
  mae: number;
  rmse: number;
  r2: number;
  train_seconds: number;
}

export interface CategoryModelMetrics {
  target: string;
  categorical_features: string[];
  numeric_features: string[];
  best_algorithm: string;
  algorithms: Record<string, ModelAlgorithmMetrics>;
  feature_importance: Record<string, number>;
}

/** FastAPI/Pydantic returns `detail` as a string OR an array of
 * {loc, msg, type} validation errors - never render either shape raw. */
function formatErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((e) => {
        if (e && typeof e === 'object' && 'msg' in e) {
          const loc = Array.isArray((e as { loc?: unknown[] }).loc) ? (e as { loc: unknown[] }).loc.at(-1) : undefined;
          return loc ? `${loc}: ${(e as { msg: string }).msg}` : String((e as { msg: string }).msg);
        }
        return typeof e === 'string' ? e : JSON.stringify(e);
      })
      .join('; ');
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${ML_API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch (err) {
    logger.error('mlService', `Network error calling ${path}`, err);
    throw new MlServiceError('Could not reach the ML service. Is it running?');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = formatErrorDetail(body?.detail, `ML service error (${response.status})`);
    logger.error('mlService', `Request to ${path} failed`, body, { status: response.status });
    throw new MlServiceError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export function predict(category: CalculatorCategory, inputs: Record<string, unknown>): Promise<MlPrediction> {
  return request<MlPrediction>(`/api/predict/${category}`, {
    method: 'POST',
    body: JSON.stringify(inputs),
  });
}

export function getModelMetrics(): Promise<Record<CalculatorCategory, CategoryModelMetrics>> {
  return request(`/api/models/metrics`);
}

export function getForecast(
  points: { date: string; value: number }[],
  periodsAhead = 6
): Promise<MlForecast> {
  return request<MlForecast>(`/api/forecast`, {
    method: 'POST',
    body: JSON.stringify({ points, periodsAhead }),
  });
}
