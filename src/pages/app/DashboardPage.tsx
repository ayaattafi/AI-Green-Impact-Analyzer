import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Leaf, Car, Droplets, Zap, UtensilsCrossed, Recycle, Smartphone,
  Brain, ArrowRight, TrendingDown, TrendingUp, Activity, Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/shared/KpiCard';
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import { ChartCard } from '@/components/shared/ChartCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { FadeIn } from '@/components/shared/Animations';
import { RowSkeleton } from '@/components/shared/Skeletons';
import { useAnalyses } from '@/hooks/useAnalyses';
import { useAuth } from '@/contexts/AuthContext';
import { formatNumber, relativeTime, categoryLabel } from '@/lib/format';
import { navItems } from '@/lib/navigation';

const categoryIcons: Record<string, typeof Car> = {
  carbon: Car, water: Droplets, energy: Zap, food: UtensilsCrossed, waste: Recycle, electronics: Smartphone,
};

const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))'];

export function DashboardPage() {
  const { analyses, loading } = useAnalyses();
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalCo2 = analyses.reduce((s, a) => s + (a.co2e ?? 0), 0);
    const avgScore = analyses.length
      ? Math.round(analyses.reduce((s, a) => s + a.green_score, 0) / analyses.length)
      : 0;
    const byCategory = analyses.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
      return acc;
    }, {});
    return { totalCo2, avgScore, total: analyses.length, byCategory };
  }, [analyses]);

  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name: categoryLabel(name), value }));
  const recentAnalyses = analyses.slice(0, 5);

  const monthlyData = useMemo(() => {
    const buckets = new Map<string, { month: string; co2: number[]; score: number[]; sortKey: string }>();
    for (const a of analyses) {
      const d = new Date(a.created_at);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      if (!buckets.has(sortKey)) buckets.set(sortKey, { month: label, co2: [], score: [], sortKey });
      const bucket = buckets.get(sortKey)!;
      if (a.co2e != null) bucket.co2.push(a.co2e);
      bucket.score.push(a.green_score);
    }
    return [...buckets.values()]
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-8)
      .map((b) => ({
        month: b.month,
        co2: Math.round(b.co2.reduce((s, x) => s + x, 0)),
        score: b.score.length ? Math.round(b.score.reduce((s, x) => s + x, 0) / b.score.length) : 0,
      }));
  }, [analyses]);

  const trendVsPrevious = useMemo(() => {
    if (monthlyData.length < 2) return { score: undefined, co2: undefined };
    const prev = monthlyData[monthlyData.length - 2];
    const curr = monthlyData[monthlyData.length - 1];
    return {
      score: prev.score > 0 ? Math.round(((curr.score - prev.score) / prev.score) * 100) : undefined,
      co2: prev.co2 > 0 ? Math.round(((curr.co2 - prev.co2) / prev.co2) * 100) : undefined,
    };
  }, [monthlyData]);

  const quickActions = navItems.filter((n) => n.group === 'calculators').slice(0, 6);

  const insights = useMemo(() => {
    const items: { icon: typeof TrendingDown; text: string; color: string }[] = [];
    if (trendVsPrevious.co2 !== undefined) {
      items.push(trendVsPrevious.co2 <= 0
        ? { icon: TrendingDown, text: `Your CO₂e is down ${Math.abs(trendVsPrevious.co2)}% vs last month — keep it up.`, color: 'text-emerald-500' }
        : { icon: TrendingUp, text: `Your CO₂e is up ${trendVsPrevious.co2}% vs last month — worth a closer look.`, color: 'text-amber-500' });
    }
    if (trendVsPrevious.score !== undefined) {
      items.push(trendVsPrevious.score >= 0
        ? { icon: TrendingUp, text: `Green score improved ${trendVsPrevious.score}% month-over-month.`, color: 'text-primary' }
        : { icon: TrendingDown, text: `Green score dropped ${Math.abs(trendVsPrevious.score)}% month-over-month.`, color: 'text-amber-500' });
    }
    const topCategory = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      items.push({ icon: Brain, text: `${categoryLabel(topCategory[0])} is your most-tracked category with ${topCategory[1]} ${topCategory[1] === 1 ? 'analysis' : 'analyses'}.`, color: 'text-accent' });
    }
    return items;
  }, [trendVsPrevious, stats.byCategory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${(user?.email ?? 'User').split('@')[0]}`}
        description="Here's your sustainability overview"
        icon={<Leaf className="h-5 w-5" />}
        action={
          <Button onClick={() => navigate('/app/calculators/carbon')}>
            New analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Green Score" value={stats.avgScore} unit="/ 100" icon={Leaf} trend={trendVsPrevious.score} trendLabel={trendVsPrevious.score !== undefined ? 'vs last month' : undefined} iconColor="text-primary" />
        <KpiCard title="Total CO₂e" value={formatNumber(stats.totalCo2)} unit="kg" icon={Activity} trend={trendVsPrevious.co2} trendLabel={trendVsPrevious.co2 !== undefined ? 'vs last month' : undefined} iconColor="text-accent" />
        <KpiCard title="Analyses" value={stats.total} icon={Brain} trendLabel="total saved" iconColor="text-emerald-500" />
        <KpiCard title="Trees Needed" value={Math.ceil(stats.totalCo2 / 21)} unit="trees" icon={Leaf} trendLabel="to offset your CO₂e" iconColor="text-lime-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score gauge */}
        <FadeIn delay={0.1}>
          <Card className="glass-card flex h-full flex-col items-center p-6">
            <h3 className="mb-4 font-semibold">Sustainability Score</h3>
            <ScoreGauge score={stats.avgScore} size={180} />
            <Badge variant="secondary" className="mt-4 bg-primary/10 text-primary">
              {stats.avgScore >= 80 ? 'Excellent' : stats.avgScore >= 60 ? 'Good' : stats.avgScore >= 40 ? 'Fair' : 'Needs work'}
            </Badge>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Based on {stats.total} analyses across all categories
            </p>
          </Card>
        </FadeIn>

        {/* CO₂ trend */}
        <FadeIn delay={0.2}>
          <ChartCard title="Carbon Emissions" description="Monthly CO₂e (kg)" className="h-full">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Area type="monotone" dataKey="co2" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#co2Grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeIn>

        {/* Category distribution */}
        <FadeIn delay={0.3}>
          <ChartCard title="Category Breakdown" description="Analyses by type" className="h-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            )}
          </ChartCard>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score trend line chart */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <ChartCard title="Score Trend" description="Monthly average green score">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--accent))', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeIn>

        {/* AI Insights */}
        <FadeIn delay={0.2}>
          <Card className="glass-card h-full p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.length > 0 ? insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex gap-3 rounded-lg bg-muted/40 p-3"
                >
                  <insight.icon className={`h-4 w-4 shrink-0 ${insight.color}`} />
                  <p className="text-sm">{insight.text}</p>
                </motion.div>
              )) : (
                <p className="text-sm text-muted-foreground">Save a couple of analyses across two months to unlock trend insights here.</p>
              )}
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/app/ai-analytics')}>
              View all insights
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </FadeIn>
      </div>

      {/* Quick actions */}
      <FadeIn delay={0.1}>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div key={action.href} whileHover={{ y: -2 }}>
                  <Card
                    className="glass-card flex cursor-pointer items-center gap-4 p-4 transition-shadow hover:shadow-glow"
                    onClick={() => navigate(action.href)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{action.label} Calculator</p>
                      <p className="text-xs text-muted-foreground">Calculate & analyze</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Recent activity */}
      <FadeIn delay={0.2}>
        <Card className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent Activity</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/history')}>
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {loading ? (
            <div className="divide-y divide-border/60 rounded-lg border border-border/60">
              {Array.from({ length: 3 }).map((_, i) => (
                <RowSkeleton key={i} columns={3} />
              ))}
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className="space-y-2">
              {recentAnalyses.map((a) => {
                const Icon = categoryIcons[a.category] ?? Leaf;
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{categoryLabel(a.category)}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(a.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{a.green_score}/100</p>
                      {a.co2e != null && <p className="text-xs text-muted-foreground">{formatNumber(a.co2e)} kg CO₂</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Leaf}
              title="No analyses yet"
              description="Run your first environmental impact calculator to see activity here."
              action={<Button size="sm" onClick={() => navigate('/app/calculators/carbon')}>Start now</Button>}
            />
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
