import { useEffect, useMemo, useState } from 'react';
import {
  Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Line, ComposedChart,
} from 'recharts';
import {
  Brain, Sparkles, TrendingUp, TrendingDown, Minus, Target, Zap,
  Car, Droplets, UtensilsCrossed, Recycle, Smartphone, Activity,
  Gauge, Lightbulb,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KpiCard } from '@/components/shared/KpiCard';
import { ChartCard } from '@/components/shared/ChartCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { FadeIn } from '@/components/shared/Animations';
import { ChartSkeleton } from '@/components/shared/Skeletons';
import { getTopFeatureTips } from '@/lib/calculators';
import { categoryConfigs } from '@/lib/calculatorConfig';
import { getMetricValue, formatDate } from '@/lib/format';
import { useAnalyses } from '@/hooks/useAnalyses';
import * as mlService from '@/services/mlService';
import type { CategoryModelMetrics, MlForecast } from '@/services/mlService';
import type { CalculatorCategory } from '@/types';

const categories: { key: CalculatorCategory; label: string; icon: typeof Car }[] = [
  { key: 'carbon', label: 'Carbon', icon: Car },
  { key: 'water', label: 'Water', icon: Droplets },
  { key: 'energy', label: 'Energy', icon: Zap },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
  { key: 'waste', label: 'Waste', icon: Recycle },
  { key: 'electronics', label: 'Electronics', icon: Smartphone },
];

const TREND_ICON = { increasing: TrendingUp, decreasing: TrendingDown, stable: Minus } as const;
const TREND_COLOR = { increasing: 'text-amber-500', decreasing: 'text-emerald-500', stable: 'text-muted-foreground' } as const;

export function AiAnalyticsPage() {
  const { analyses, loading: analysesLoading } = useAnalyses();
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory>('carbon');
  const [metrics, setMetrics] = useState<Record<string, CategoryModelMetrics> | null>(null);
  const [metricsError, setMetricsError] = useState(false);
  const [forecast, setForecast] = useState<MlForecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    mlService.getModelMetrics().then(setMetrics).catch(() => setMetricsError(true));
  }, []);

  const byCategory = useMemo(() => {
    const map = new Map<CalculatorCategory, { date: string; value: number }[]>();
    for (const category of categories.map((c) => c.key)) map.set(category, []);
    const sorted = [...analyses].sort((a, b) => a.created_at.localeCompare(b.created_at));
    for (const a of sorted) {
      const key = categoryConfigs[a.category].primaryMetricKey;
      const value = getMetricValue(a.outputs as unknown as Record<string, unknown>, key) || a.co2e || a.green_score;
      map.get(a.category)?.push({ date: a.created_at, value });
    }
    return map;
  }, [analyses]);

  const activePoints = byCategory.get(activeCategory) ?? [];

  useEffect(() => {
    if (activePoints.length === 0) {
      setForecast(null);
      return;
    }
    setForecastLoading(true);
    mlService.getForecast(activePoints, 6)
      .then(setForecast)
      .catch(() => setForecast(null))
      .finally(() => setForecastLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, analyses]);

  const activeMetrics = metrics?.[activeCategory];
  const activeConfig = categories.find((c) => c.key === activeCategory)!;
  const tips = activeMetrics ? getTopFeatureTips(activeCategory, activeMetrics.feature_importance, 3) : [];

  const overallAvgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.green_score, 0) / analyses.length)
    : 0;

  const chartData = forecast?.points.map((p) => ({
    label: p.isHistorical ? formatDate(activePoints[p.index]?.date ?? '') : `+${p.index - activePoints.length + 1}`,
    actual: p.actual ?? undefined,
    predicted: p.predicted,
    confidenceLow: p.confidenceLow,
    confidenceHigh: p.confidenceHigh,
  })) ?? [];

  const TrendIcon = forecast ? TREND_ICON[forecast.trend] : Minus;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Predictive insights from GREENLY's trained ML models"
        icon={<Brain className="h-5 w-5" />}
        action={
          activeMetrics ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
              {activeMetrics.best_algorithm.replace('_', ' ')} • R² {activeMetrics.algorithms[activeMetrics.best_algorithm].r2.toFixed(3)}
            </Badge>
          ) : metricsError ? (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive">ML service unavailable</Badge>
          ) : null
        }
      />

      {/* Model KPIs - real numbers from metrics.json / user's own history */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Model Confidence"
          value={activeMetrics ? Math.round(activeMetrics.algorithms[activeMetrics.best_algorithm].r2 * 100) : '—'}
          unit={activeMetrics ? '%' : ''}
          icon={Gauge} iconColor="text-primary"
          trendLabel={`${activeConfig.label} model (test R²)`}
        />
        <KpiCard title="Your Analyses" value={analyses.length} icon={Activity} iconColor="text-accent" trendLabel="saved to history" />
        <KpiCard
          title="Forecast MAE"
          value={activeMetrics ? activeMetrics.algorithms[activeMetrics.best_algorithm].mae.toFixed(2) : '—'}
          icon={Target} iconColor="text-emerald-500"
          trendLabel="avg error on held-out test data"
        />
        <KpiCard title="Avg Green Score" value={overallAvgScore} unit="/100" icon={Sparkles} iconColor="text-lime-500" trendLabel="across all analyses" />
      </div>

      {/* Category selector */}
      <FadeIn>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = c.key === activeCategory;
            return (
              <Button key={c.key} variant={active ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(c.key)}>
                <Icon className="mr-1.5 h-4 w-4" />
                {c.label}
                {(byCategory.get(c.key)?.length ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{byCategory.get(c.key)?.length}</Badge>
                )}
              </Button>
            );
          })}
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Forecast chart - real trend fit over the user's own saved history */}
        <FadeIn className="lg:col-span-2">
          {analysesLoading || forecastLoading ? (
            <ChartSkeleton />
          ) : (
            <ChartCard
              title={`${activeConfig.label} Forecast`}
              description={forecast ? `${forecast.method === 'linear_trend_with_residual_band' ? 'Trend fit over your saved history' : 'Not enough history yet'}` : 'No saved analyses for this category yet'}
              action={forecast && <Badge variant="secondary" className="bg-accent/10 text-accent">{Math.round(forecast.modelConfidence * 100)}% confident</Badge>}
            >
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="aiForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="confidenceHigh" name="Upper bound" stroke="none" fill="url(#aiForecast)" />
                    <Line type="monotone" dataKey="predicted" name="Trend" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={activeConfig.icon}
                  title="No forecast yet"
                  description={`Save a ${activeConfig.label.toLowerCase()} analysis to start building a real trend forecast.`}
                />
              )}
            </ChartCard>
          )}
        </FadeIn>

        {/* Trend & confidence */}
        <FadeIn delay={0.1}>
          <Card className="glass-card h-full p-6">
            <h3 className="mb-4 font-semibold">Trend Analysis</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trend direction</span>
                  <span className={`flex items-center gap-1 text-sm font-semibold ${forecast ? TREND_COLOR[forecast.trend] : 'text-muted-foreground'}`}>
                    <TrendIcon className="h-4 w-4" /> {forecast ? forecast.trend : 'No data'}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold">{forecast ? `${forecast.trendPercent > 0 ? '+' : ''}${forecast.trendPercent}%` : '—'}</p>
                <p className="text-xs text-muted-foreground">projected from your saved history</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Forecast confidence</span>
                  <span className="font-semibold">{forecast ? Math.round(forecast.modelConfidence * 100) : 0}%</span>
                </div>
                <Progress value={forecast ? forecast.modelConfidence * 100 : 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Grows with more saved analyses - {activePoints.length} point{activePoints.length === 1 ? '' : 's'} so far.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Model quality (test R²)</span>
                  <span className="font-semibold">{activeMetrics ? activeMetrics.algorithms[activeMetrics.best_algorithm].r2.toFixed(3) : '—'}</span>
                </div>
                <Progress value={activeMetrics ? activeMetrics.algorithms[activeMetrics.best_algorithm].r2 * 100 : 0} className="h-2" />
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Feature importance + Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <ChartCard title="Feature Importance" description={`What drives the ${activeConfig.label.toLowerCase()} model's predictions`}>
            {activeMetrics ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={Object.entries(activeMetrics.feature_importance).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value: Math.round(value * 100) }))}
                  margin={{ left: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">Loading model data…</div>
            )}
          </ChartCard>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="glass-card h-full p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Personalized Recommendations</h3>
                <p className="text-xs text-muted-foreground">Derived from the model&apos;s real feature importance</p>
              </div>
            </div>
            <div className="space-y-3">
              {tips.length > 0 ? tips.map((t, i) => (
                <div key={t.feature} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{t.tip}</p>
                    <Badge variant="secondary" className="mt-1.5 bg-primary/5 text-primary">
                      {Math.round(t.share * 100)}% model weight
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Waiting on model data to generate recommendations.</p>
              )}
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Model comparison - real MAE/RMSE/R2 across all 5 algorithms */}
      <FadeIn>
        <Card className="glass-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold">Algorithm Comparison</h3>
            <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">{activeConfig.label}</Badge>
          </div>
          {activeMetrics ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Algorithm</th>
                    <th className="py-2 pr-4 text-right font-medium">MAE</th>
                    <th className="py-2 pr-4 text-right font-medium">RMSE</th>
                    <th className="py-2 pr-4 text-right font-medium">R²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Object.entries(activeMetrics.algorithms).map(([name, m]) => (
                    <tr key={name} className={name === activeMetrics.best_algorithm ? 'bg-primary/5' : ''}>
                      <td className="py-2 pr-4 capitalize">
                        {name.replace('_', ' ')}
                        {name === activeMetrics.best_algorithm && <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">selected</Badge>}
                      </td>
                      <td className="py-2 pr-4 text-right">{m.mae}</td>
                      <td className="py-2 pr-4 text-right">{m.rmse}</td>
                      <td className="py-2 pr-4 text-right">{m.r2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {metricsError ? 'Could not reach the ML service to load model metrics.' : 'Loading…'}
            </p>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
