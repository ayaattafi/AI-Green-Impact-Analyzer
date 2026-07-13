import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Car, Droplets, Zap, UtensilsCrossed, Recycle, Smartphone,
  Leaf, Save, RotateCcw, Sparkles, TrendingDown, ArrowRight, Info, Brain, Gauge,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import { PageHeader } from '@/components/shared/PageHeader';
import { FadeIn } from '@/components/shared/Animations';
import { calculate } from '@/lib/calculators';
import { categoryConfigs, validCategories, type FieldConfig } from '@/lib/calculatorConfig';
import { saveAnalysis } from '@/services/analysisService';
import { formatNumber, getMetricValue } from '@/lib/format';
import { logger } from '@/lib/logger';
import type { CalculatorCategory, CalculationResult } from '@/types';

const icons: Record<string, typeof Car> = {
  Car, Droplets, Zap, UtensilsCrossed, Recycle, Smartphone,
};

export function CalculatorPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const validCategory = validCategories.includes(category as CalculatorCategory)
    ? (category as CalculatorCategory)
    : 'carbon';

  const config = categoryConfigs[validCategory];
  const Icon = icons[config.icon] ?? Leaf;

  const [values, setValues] = useState<Record<string, number | string>>(() => {
    const init: Record<string, number | string> = {};
    config.fields.forEach((f) => { init[f.key] = f.defaultValue; });
    return init;
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  // React Router reuses this component instance when only the :category
  // param changes (e.g. clicking Water while on the Carbon calculator) -
  // without this, `values` would keep the old category's field keys and
  // every field would submit as NaN/null against the new category's schema.
  useEffect(() => {
    const init: Record<string, number | string> = {};
    config.fields.forEach((f) => { init[f.key] = f.defaultValue; });
    setValues(init);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validCategory]);

  const handleChange = (key: string, value: number | string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const numericInputs: Record<string, unknown> = {};
      config.fields.forEach((f) => {
        numericInputs[f.key] = f.type === 'number' ? Number(values[f.key]) : values[f.key];
      });
      const res = await calculate(validCategory, numericInputs);
      setResult(res);
    } catch (err) {
      logger.error('CalculatorPage', 'Prediction failed', err, { category: validCategory });
      toast.error(err instanceof Error ? err.message : 'Prediction failed. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    const init: Record<string, number | string> = {};
    config.fields.forEach((f) => { init[f.key] = f.defaultValue; });
    setValues(init);
    setResult(null);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await saveAnalysis({
        category: validCategory,
        inputs: result.inputs,
        outputs: result.outputs as unknown as Record<string, unknown>,
        ai_recommendation: result.recommendation,
        green_score: result.outputs.greenScore,
        co2e: result.outputs.co2e ?? null,
      });
      toast.success('Analysis saved to history');
      navigate('/app/history');
    } catch (err) {
      logger.error('CalculatorPage', 'Failed to save analysis', err, { category: validCategory });
      toast.error('Failed to save analysis. Make sure you are signed in.');
    } finally {
      setSaving(false);
    }
  };

  const detailEntries = result ? Object.entries(result.outputs.details) : [];
  const topFeatures = result?.outputs.featureContributions
    ? Object.entries(result.outputs.featureContributions).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        icon={<Icon className="h-5 w-5" />}
        action={
          <div className="flex gap-2">
            {validCategories.filter((c) => c !== validCategory).slice(0, 3).map((c) => {
              const OtherIcon = icons[categoryConfigs[c].icon] ?? Leaf;
              return (
                <Button key={c} variant="outline" size="sm" onClick={() => navigate(`/app/calculators/${c}`)}>
                  <OtherIcon className="mr-1.5 h-4 w-4" />
                  {categoryConfigs[c].title.replace(' Calculator', '')}
                </Button>
              );
            })}
          </div>
        }
      />

      {/* Quick switch tabs */}
      <div className="flex flex-wrap gap-2">
        {validCategories.map((c) => (
          <Link key={c} to={`/app/calculators/${c}`}>
            <Button variant={c === validCategory ? 'default' : 'outline'} size="sm">
              {categoryConfigs[c].title.replace(' Calculator', '')}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input form */}
        <FadeIn className="lg:col-span-2">
          <Card className="glass-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-primary" />
              Input Parameters
            </h3>
            <div className="space-y-4">
              {config.fields.map((field: FieldConfig) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-sm">
                    {field.label}
                    {field.unit && <span className="ml-1 text-xs text-muted-foreground">({field.unit})</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <Select value={String(values[field.key])} onValueChange={(v) => handleChange(field.key, v)}>
                      <SelectTrigger id={field.key}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.key}
                      type="number"
                      placeholder={field.placeholder}
                      min={field.min}
                      step={field.step}
                      value={String(values[field.key])}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="flex-1" onClick={handleCalculate} disabled={calculating}>
                {calculating ? 'Calculating...' : 'Calculate'}
                {!calculating && <Sparkles className="ml-2 h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </FadeIn>

        {/* Results */}
        <div className="space-y-6 lg:col-span-3">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Main result card */}
                <Card className="glass-card p-6 shadow-glow">
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                    <ScoreGauge score={result.outputs.greenScore} size={160} label="Green Score" />
                    <div className="flex-1 space-y-3">
                      <div className="rounded-xl bg-primary/5 p-4">
                        <p className="text-sm text-muted-foreground">{config.primaryMetricLabel}</p>
                        <p className="text-3xl font-extrabold text-primary">
                          {formatNumber(getMetricValue(result.outputs as unknown as Record<string, unknown>, config.primaryMetricKey))}
                          {validCategory === 'carbon' && <span className="ml-1 text-base">kg</span>}
                          {validCategory === 'water' && <span className="ml-1 text-base">L</span>}
                          {validCategory === 'energy' && <span className="ml-1 text-base">kWh</span>}
                          {validCategory === 'waste' && <span className="ml-1 text-base">kg</span>}
                          {validCategory === 'food' && <span className="ml-1 text-base">kg</span>}
                          {validCategory === 'electronics' && <span className="ml-1 text-base">kWh</span>}
                        </p>
                      </div>
                      {result.outputs.treesNeeded != null && (
                        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-4">
                          <Leaf className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">{result.outputs.treesNeeded}</p>
                            <p className="text-xs text-muted-foreground">trees needed to offset / year</p>
                          </div>
                        </div>
                      )}
                      {result.outputs.cost != null && (
                        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-4">
                          <TrendingDown className="h-8 w-8 text-accent" />
                          <div>
                            <p className="text-2xl font-bold">${formatNumber(result.outputs.cost)}</p>
                            <p className="text-xs text-muted-foreground">estimated cost</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* AI Recommendation */}
                <Card className="glass-card border-primary/20 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Recommendation</h3>
                      <p className="text-xs text-muted-foreground">Personalized based on your inputs</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">AI</Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{result.recommendation}</p>
                </Card>

                {/* Details breakdown */}
                {detailEntries.length > 0 && (
                  <Card className="glass-card p-6">
                    <h3 className="mb-4 font-semibold">Detailed Breakdown</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detailEntries.map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="font-semibold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Model insights - real confidence + feature importance from the trained model */}
                {result.outputs.modelUsed && (
                  <Card className="glass-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Model Insights</h3>
                        <p className="text-xs text-muted-foreground">How this prediction was generated</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary capitalize">
                        {result.outputs.modelUsed.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Model confidence (test R²)</span>
                        <span className="font-semibold">{Math.round((result.outputs.confidence ?? 0) * 100)}%</span>
                      </div>
                      <Progress value={(result.outputs.confidence ?? 0) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        You rank better than {result.outputs.percentileRank}% of the model&apos;s training profiles for this category.
                      </p>
                    </div>
                    {topFeatures.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Most influential factors (model feature importance)</p>
                        {topFeatures.map(([feature, share]) => (
                          <div key={feature} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="font-medium">{Math.round(share * 100)}%</span>
                            </div>
                            <Progress value={share * 100} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}

                {/* Comparison bar chart */}
                {detailEntries.length > 0 && (
                  <Card className="glass-card p-6">
                    <h3 className="mb-4 font-semibold">Impact Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={detailEntries.filter(([, v]) => typeof v === 'number').map(([label, val]) => ({ name: label, value: Number(val) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save to history'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/app/ai-analytics')}>
                    Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="glass-card flex h-full min-h-[400px] flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold">Ready to calculate</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Fill in the parameters and click Calculate to see your environmental impact,
                    green score, and AI-powered recommendations.
                  </p>
                  <Button className="mt-6" onClick={handleCalculate}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Calculate now
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
