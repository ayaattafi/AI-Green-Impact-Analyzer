export type CalculatorCategory =
  | 'carbon'
  | 'water'
  | 'energy'
  | 'food'
  | 'waste'
  | 'electronics';

export interface AnalysisRecord {
  id: string;
  user_id: string;
  category: CalculatorCategory;
  inputs: Record<string, unknown>;
  outputs: AnalysisOutputs;
  ai_recommendation: string | null;
  green_score: number;
  co2e: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisOutputs {
  co2e?: number;
  greenScore: number;
  treesNeeded?: number;
  waterLiters?: number;
  energyKwh?: number;
  cost?: number;
  wasteKg?: number;
  details: Record<string, number | string>;
  /** ML model metadata - present when computed via the ML service. */
  modelUsed?: string;
  confidence?: number;
  percentileRank?: number;
  featureContributions?: Record<string, number>;
}

export interface CalculationResult {
  category: CalculatorCategory;
  inputs: Record<string, unknown>;
  outputs: AnalysisOutputs;
  recommendation: string;
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface PredictionResult {
  category: CalculatorCategory;
  forecast: ForecastPoint[];
  modelConfidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercent: number;
  recommendations: string[];
}

export type ChartDataPoint = Record<string, string | number>;

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  organization?: string;
  location?: string;
  createdAt: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
