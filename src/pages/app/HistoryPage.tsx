import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  History as HistoryIcon, Search, Trash2, GitCompare, Leaf,
  Car, Droplets, Zap, UtensilsCrossed, Recycle, Smartphone,
  X, ArrowRight, Sparkles,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { RowSkeleton } from '@/components/shared/Skeletons';
import { FadeIn } from '@/components/shared/Animations';
import { useAnalyses } from '@/hooks/useAnalyses';
import { formatDate, relativeTime, categoryLabel, scoreColor } from '@/lib/format';
import { logger } from '@/lib/logger';
import type { AnalysisRecord } from '@/types';

const icons: Record<string, typeof Car> = {
  carbon: Car, water: Droplets, energy: Zap, food: UtensilsCrossed, waste: Recycle, electronics: Smartphone,
};

export function HistoryPage() {
  const { analyses, loading, remove } = useAnalyses();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = analyses;
    if (filter !== 'all') result = result.filter((a) => a.category === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        categoryLabel(a.category).toLowerCase().includes(q) ||
        a.ai_recommendation?.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'score') result = [...result].sort((a, b) => b.green_score - a.green_score);
    return result;
  }, [analyses, filter, search, sortBy]);

  const compareData = useMemo(() => {
    return selected
      .map((id) => analyses.find((a) => a.id === id))
      .filter(Boolean)
      .map((a) => ({
        name: `${categoryLabel(a!.category).slice(0, 8)}\n${formatDate(a!.created_at).slice(0, 6)}`,
        score: a!.green_score,
        co2: a!.co2e ?? 0,
      }));
  }, [selected, analyses]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id].slice(-4)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget);
      setSelected((prev) => prev.filter((s) => s !== deleteTarget));
      toast.success('Analysis deleted');
    } catch (err) {
      logger.error('HistoryPage', 'Failed to delete analysis', err, { id: deleteTarget });
      toast.error('Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Search, filter, and compare your past analyses"
        icon={<HistoryIcon className="h-5 w-5" />}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={selected.length < 2} onClick={() => setCompareOpen(true)}>
              <GitCompare className="mr-1.5 h-4 w-4" />
              Compare ({selected.length})
            </Button>
            <Button size="sm" onClick={() => navigate('/app/calculators/carbon')}>
              New analysis
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Controls */}
      <FadeIn>
        <Card className="glass-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search analyses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="carbon">Carbon</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'score')}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort: Date</SelectItem>
                <SelectItem value="score">Sort: Score</SelectItem>
              </SelectContent>
            </Select>
            {(search || filter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilter('all'); }}>
                <X className="mr-1 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* List */}
      {loading ? (
        <Card className="glass-card p-4">
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} columns={4} />)}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="glass-card p-6">
          <EmptyState
            icon={HistoryIcon}
            title={analyses.length === 0 ? 'No analyses yet' : 'No results found'}
            description={analyses.length === 0
              ? 'Run a calculator to start building your history.'
              : 'Try adjusting your search or filters.'}
            action={analyses.length === 0 ? (
              <Button size="sm" onClick={() => navigate('/app/calculators/carbon')}>Start now</Button>
            ) : <Button size="sm" variant="outline" onClick={() => { setSearch(''); setFilter('all'); }}>Clear filters</Button>}
          />
        </Card>
      ) : (
        <Card className="glass-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'analysis' : 'analyses'}
              {selected.length > 0 && ` • ${selected.length} selected for comparison`}
            </p>
          </div>
          <div className="divide-y divide-border/60">
            <AnimatePresence>
              {filtered.map((analysis, i) => {
                const Icon = icons[analysis.category] ?? Leaf;
                const isSelected = selected.includes(analysis.id);
                return (
                  <motion.div
                    key={analysis.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(analysis.id)} />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{categoryLabel(analysis.category)}</p>
                        <Badge variant="secondary" className="bg-muted text-xs">{formatDate(analysis.created_at)}</Badge>
                      </div>
                      {analysis.ai_recommendation && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{analysis.ai_recommendation}</p>
                      )}
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className={`text-lg font-bold ${scoreColor(analysis.green_score)}`}>{analysis.green_score}</p>
                      <p className="text-xs text-muted-foreground">score</p>
                    </div>
                    {analysis.co2e != null && (
                      <div className="hidden text-right md:block">
                        <p className="text-sm font-semibold">{Number(analysis.co2e).toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">kg CO₂</p>
                      </div>
                    )}
                    <div className="hidden text-right lg:block">
                      <p className="text-xs text-muted-foreground">{relativeTime(analysis.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(analysis.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Compare dialog */}
      <CompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        data={compareData}
        analyses={selected.map((id) => analyses.find((a) => a.id === id)).filter(Boolean) as AnalysisRecord[]}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The analysis will be permanently removed from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CompareDialog({
  open, onOpenChange, data, analyses,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: { name: string; score: number; co2: number }[];
  analyses: AnalysisRecord[];
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" /> Comparison
          </AlertDialogTitle>
          <AlertDialogDescription>Side-by-side comparison of selected analyses</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {data.length >= 2 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="score" name="Green Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="co2" name="CO₂ (kg)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {analyses.map((a) => (
              <div key={a.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{categoryLabel(a.category)}</span>
                  <span className={`text-lg font-bold ${scoreColor(a.green_score)}`}>{a.green_score}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                {a.ai_recommendation && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    {a.ai_recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
