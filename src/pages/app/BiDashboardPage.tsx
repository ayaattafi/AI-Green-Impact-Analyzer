import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  BarChart3, TrendingUp, Leaf, Sparkles, Download,
  Zap, Droplets,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/shared/KpiCard';
import { ChartCard } from '@/components/shared/ChartCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { FadeIn } from '@/components/shared/Animations';
import { ChartSkeleton } from '@/components/shared/Skeletons';
import { useAnalyses } from '@/hooks/useAnalyses';
import { downloadFile, toCsv, formatNumber, categoryLabel, getMetricValue } from '@/lib/format';
import { categoryConfigs, validCategories } from '@/lib/calculatorConfig';
import type { AnalysisRecord, CalculatorCategory } from '@/types';

const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))'];

const PERIOD_DAYS: Record<string, number | null> = { '3m': 90, '6m': 180, '12m': 365, ytd: null };

function periodCutoff(period: string): Date {
  const now = new Date();
  if (period === 'ytd') return new Date(now.getFullYear(), 0, 1);
  const days = PERIOD_DAYS[period] ?? 365;
  return new Date(now.getTime() - days * 86400000);
}

function primaryValue(a: AnalysisRecord): number {
  const key = categoryConfigs[a.category].primaryMetricKey;
  return getMetricValue(a.outputs as unknown as Record<string, unknown>, key) || a.co2e || 0;
}

export function BiDashboardPage() {
  const { analyses, loading } = useAnalyses();
  const [period, setPeriod] = useState('12m');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CalculatorCategory>('all');

  const filtered = useMemo(() => {
    const cutoff = periodCutoff(period);
    return analyses.filter((a) => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      return new Date(a.created_at) >= cutoff;
    });
  }, [analyses, period, categoryFilter]);

  const stats = useMemo(() => {
    const co2Categories: CalculatorCategory[] = ['carbon', 'food', 'waste'];
    const totalCo2 = filtered.filter((a) => co2Categories.includes(a.category) || a.category === 'energy' || a.category === 'electronics')
      .reduce((s, a) => s + (a.co2e ?? primaryValue(a)), 0);
    const totalWater = filtered.filter((a) => a.category === 'water').reduce((s, a) => s + primaryValue(a), 0);
    const totalEnergy = filtered.filter((a) => a.category === 'energy' || a.category === 'electronics')
      .reduce((s, a) => s + (getMetricValue(a.outputs as unknown as Record<string, unknown>, 'energyKwh')), 0);
    const avgScore = filtered.length ? Math.round(filtered.reduce((s, a) => s + a.green_score, 0) / filtered.length) : 0;
    return { totalCo2, totalWater, totalEnergy, avgScore, count: filtered.length };
  }, [filtered]);

  const monthlyTrend = useMemo(() => {
    const buckets = new Map<string, { month: string; carbon: number; water: number; energy: number; score: number[] }>();
    for (const a of filtered) {
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!buckets.has(key)) buckets.set(key, { month: label, carbon: 0, water: 0, energy: 0, score: [] });
      const bucket = buckets.get(key)!;
      if (a.category === 'carbon' || a.category === 'food' || a.category === 'waste') bucket.carbon += a.co2e ?? primaryValue(a);
      if (a.category === 'water') bucket.water += primaryValue(a);
      if (a.category === 'energy' || a.category === 'electronics') bucket.energy += getMetricValue(a.outputs as unknown as Record<string, unknown>, 'energyKwh');
      bucket.score.push(a.green_score);
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({
      month: v.month, carbon: Math.round(v.carbon), water: Math.round(v.water), energy: Math.round(v.energy),
      score: v.score.length ? Math.round(v.score.reduce((s, x) => s + x, 0) / v.score.length) : 0,
    }));
  }, [filtered]);

  const yearlyComparison = useMemo(() => {
    const buckets = new Map<string, { carbon: number; water: number; energy: number; score: number[] }>();
    for (const a of filtered) {
      const year = String(new Date(a.created_at).getFullYear());
      if (!buckets.has(year)) buckets.set(year, { carbon: 0, water: 0, energy: 0, score: [] });
      const b = buckets.get(year)!;
      if (a.category === 'carbon' || a.category === 'food' || a.category === 'waste') b.carbon += a.co2e ?? primaryValue(a);
      if (a.category === 'water') b.water += primaryValue(a);
      if (a.category === 'energy' || a.category === 'electronics') b.energy += getMetricValue(a.outputs as unknown as Record<string, unknown>, 'energyKwh');
      b.score.push(a.green_score);
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([year, v]) => ({
      year, carbon: Math.round(v.carbon), water: Math.round(v.water), energy: Math.round(v.energy),
      score: v.score.length ? Math.round(v.score.reduce((s, x) => s + x, 0) / v.score.length) : 0,
    }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const counts = new Map<CalculatorCategory, number>();
    for (const a of filtered) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    return [...counts.entries()].map(([name, value]) => ({ name: categoryLabel(name), value }));
  }, [filtered]);

  const scoreByCategory = useMemo(() => {
    const buckets = new Map<CalculatorCategory, number[]>();
    for (const a of filtered) {
      if (!buckets.has(a.category)) buckets.set(a.category, []);
      buckets.get(a.category)!.push(a.green_score);
    }
    return validCategories.map((c) => {
      const scores = buckets.get(c) ?? [];
      return {
        category: categoryLabel(c).split(' ')[0],
        current: scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0,
        target: 85,
      };
    });
  }, [filtered]);

  const summary = useMemo(() => {
    if (filtered.length === 0) return null;
    const sorted = [...scoreByCategory].filter((s) => s.current > 0).sort((a, b) => b.current - a.current);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const half = Math.floor(monthlyTrend.length / 2) || 1;
    const firstHalfScore = monthlyTrend.slice(0, half).reduce((s, m) => s + m.score, 0) / half;
    const secondHalfScore = monthlyTrend.slice(half).reduce((s, m) => s + m.score, 0) / (monthlyTrend.length - half || 1);
    const improving = secondHalfScore >= firstHalfScore;
    return { best, worst, improving, scoreDelta: Math.round(secondHalfScore - firstHalfScore) };
  }, [filtered, scoreByCategory, monthlyTrend]);

  const handleExport = () => {
    const csv = toCsv(filtered.map((a) => ({
      Date: a.created_at, Category: categoryLabel(a.category), Score: a.green_score, 'CO2e (kg)': a.co2e ?? '',
    })));
    downloadFile(csv, `bi-dashboard-${period}.csv`, 'text/csv');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <ChartSkeleton />
        <div className="grid gap-6 lg:grid-cols-2"><ChartSkeleton /><ChartSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence"
        description="Analytics across your saved sustainability analyses"
        icon={<BarChart3 className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {validCategories.map((c) => <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No data in this range"
          description="Save some calculator analyses to see them aggregated here."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total CO₂e" value={formatNumber(stats.totalCo2)} unit="kg" icon={Leaf} iconColor="text-primary" trendLabel={`${stats.count} analyses`} />
            <KpiCard title="Water Used" value={formatNumber(stats.totalWater)} unit="L" icon={Droplets} iconColor="text-accent" />
            <KpiCard title="Energy Used" value={formatNumber(stats.totalEnergy)} unit="kWh" icon={Zap} iconColor="text-emerald-500" />
            <KpiCard title="Avg Score" value={stats.avgScore} unit="/100" icon={TrendingUp} iconColor="text-lime-500" />
          </div>

          <FadeIn>
            <ChartCard title="Monthly Trends" description="Carbon and energy over the selected period">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="biCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="biEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="carbon" name="CO₂e (kg)" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#biCarbon)" />
                  <Area type="monotone" dataKey="energy" name="Energy (kWh)" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="url(#biEnergy)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </FadeIn>

          <div className="grid gap-6 lg:grid-cols-2">
            <FadeIn>
              <ChartCard title="Category Distribution" description="Share of saved analyses by category">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {categoryData.map((entry, i) => <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </FadeIn>

            <FadeIn delay={0.1}>
              <ChartCard title="Yearly Comparison" description="CO₂e by year">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={yearlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="carbon" name="CO₂ (kg)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </FadeIn>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FadeIn>
              <ChartCard title="Score Radar" description="Average green score vs. an 85/100 target, by category">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={scoreByCategory}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="Target" dataKey="target" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} strokeDasharray="5 5" />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
            </FadeIn>

            <FadeIn delay={0.1}>
              <ChartCard title="Score Improvement" description="Average green score by month">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="score" name="Green Score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </FadeIn>
          </div>

          {/* AI Summary - generated from real aggregates, not static prose */}
          {summary && (
            <FadeIn>
              <Card className="glass-card border-primary/20 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Executive Summary</h3>
                    <p className="text-xs text-muted-foreground">Generated from your {stats.count} analyses in this range</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">AI</Badge>
                </div>
                <div className="space-y-3 text-sm leading-relaxed">
                  <p>
                    <span className="font-semibold text-primary">Overall trend:</span>{' '}
                    {summary.improving
                      ? `Your average green score improved by ${Math.max(1, summary.scoreDelta)} points across this period. Keep it up.`
                      : `Your average green score dipped by ${Math.abs(summary.scoreDelta)} points across this period — worth a closer look.`}
                  </p>
                  {summary.best && (
                    <p>
                      <span className="font-semibold text-primary">Strongest category:</span>{' '}
                      {summary.best.category} is your best-performing area, averaging {summary.best.current}/100.
                    </p>
                  )}
                  {summary.worst && summary.worst.category !== summary.best?.category && (
                    <p>
                      <span className="font-semibold text-primary">Area for improvement:</span>{' '}
                      {summary.worst.category} trails at {summary.worst.current}/100 — the biggest opportunity for gains.
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-primary">Overall green score:</span>{' '}
                    {stats.avgScore}/100 across {stats.count} saved {stats.count === 1 ? 'analysis' : 'analyses'}.
                  </p>
                </div>
              </Card>
            </FadeIn>
          )}
        </>
      )}
    </div>
  );
}
