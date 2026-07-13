import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  FileText, Download, FileSpreadsheet, FileDown,
  CheckCircle2, Leaf, BarChart3,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { FadeIn } from '@/components/shared/Animations';
import { RowSkeleton } from '@/components/shared/Skeletons';
import { useAnalyses } from '@/hooks/useAnalyses';
import { downloadFile, toCsv, formatDate, categoryLabel, formatNumber } from '@/lib/format';
import { logger } from '@/lib/logger';
import { buildPdfReport } from '@/services/pdfReportService';

const CHART_ELEMENT_ID = 'report-chart-capture';

export function ReportsPage() {
  const { analyses, loading } = useAnalyses();
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    details: true,
    recommendations: true,
    charts: true,
  });

  const filtered = useMemo(() => {
    return categoryFilter === 'all' ? analyses : analyses.filter((a) => a.category === categoryFilter);
  }, [analyses, categoryFilter]);

  const reportStats = useMemo(() => {
    const totalCo2 = filtered.reduce((s, a) => s + (a.co2e ?? 0), 0);
    const avgScore = filtered.length ? Math.round(filtered.reduce((s, a) => s + a.green_score, 0) / filtered.length) : 0;
    const best = filtered.length ? Math.max(...filtered.map((a) => a.green_score)) : 0;
    const worst = filtered.length ? Math.min(...filtered.map((a) => a.green_score)) : 0;
    return { totalCo2, avgScore, best, worst, count: filtered.length };
  }, [filtered]);

  const scoreByCategory = useMemo(() => {
    const buckets = new Map<string, number[]>();
    for (const a of filtered) {
      if (!buckets.has(a.category)) buckets.set(a.category, []);
      buckets.get(a.category)!.push(a.green_score);
    }
    return [...buckets.entries()].map(([cat, scores]) => ({
      name: categoryLabel(cat).split(' ')[0],
      score: Math.round(scores.reduce((s, x) => s + x, 0) / scores.length),
    }));
  }, [filtered]);

  const generateCSV = () => {
    const rows = filtered.map((a) => ({
      Date: formatDate(a.created_at),
      Category: categoryLabel(a.category),
      'Green Score': a.green_score,
      'CO₂e (kg)': a.co2e ?? 'N/A',
      Recommendation: a.ai_recommendation ?? '',
      Notes: a.notes ?? '',
    }));
    const csv = toCsv(rows);
    downloadFile(csv, `greenly-report-${Date.now()}.csv`, 'text/csv');
    toast.success('CSV report downloaded');
  };

  const generatePDF = async () => {
    setExporting(true);
    try {
      const doc = await buildPdfReport(
        filtered,
        reportStats,
        includeSections,
        includeSections.charts ? CHART_ELEMENT_ID : undefined
      );
      doc.save(`greenly-report-${Date.now()}.pdf`);
      toast.success('PDF report downloaded');
    } catch (err) {
      logger.error('ReportsPage', 'Failed to generate PDF report', err, { count: filtered.length });
      toast.error('Failed to generate PDF report');
    } finally {
      setExporting(false);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('No analyses to export');
      return;
    }
    if (format === 'csv') generateCSV();
    else generatePDF();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and export professional sustainability reports"
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <FadeIn className="lg:col-span-1">
          <Card className="glass-card p-6">
            <h3 className="mb-4 font-semibold">Report Configuration</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormat('pdf')}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      format === 'pdf' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <FileDown className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">PDF</span>
                  </button>
                  <button
                    onClick={() => setFormat('csv')}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      format === 'csv' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <FileSpreadsheet className="h-6 w-6 text-accent" />
                    <span className="text-sm font-medium">CSV</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category Filter</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              </div>

              {format === 'pdf' && (
                <div className="space-y-2">
                  <Label>Include Sections</Label>
                  <div className="space-y-2">
                    {[
                      { key: 'summary', label: 'Executive summary' },
                      { key: 'details', label: 'Detailed breakdown' },
                      { key: 'recommendations', label: 'AI recommendations' },
                      { key: 'charts', label: 'Visual charts' },
                    ].map((s) => (
                      <label key={s.key} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={includeSections[s.key as keyof typeof includeSections]}
                          onCheckedChange={(v) => setIncludeSections((prev) => ({ ...prev, [s.key]: !!v }))}
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleExport} disabled={loading || exporting || filtered.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Generating…' : `Export ${format.toUpperCase()} Report`}
              </Button>
            </div>
          </Card>
        </FadeIn>

        {/* Preview */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <Card className="glass-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Report Preview</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
              </Badge>
            </div>

            {loading ? (
              <div className="divide-y divide-border/60 rounded-lg border border-border/60">
                {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} columns={4} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No data to report"
                description="Run some analyses first to generate a report."
              />
            ) : (
              <div className="space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Analyses', value: reportStats.count, icon: BarChart3 },
                    { label: 'Avg Score', value: reportStats.avgScore, icon: Leaf },
                    { label: 'Total CO₂', value: `${formatNumber(reportStats.totalCo2)}kg`, icon: FileText },
                    { label: 'Best Score', value: reportStats.best, icon: CheckCircle2 },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-muted/40 p-3">
                      <s.icon className="mb-1 h-4 w-4 text-primary" />
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Chart - captured into the PDF when "Visual charts" is enabled */}
                {includeSections.charts && scoreByCategory.length > 0 && (
                  <div id={CHART_ELEMENT_ID} className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Average green score by category</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={scoreByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                        <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Report table preview */}
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Date</th>
                        <th className="px-3 py-2 text-left font-medium">Category</th>
                        <th className="px-3 py-2 text-right font-medium">Score</th>
                        <th className="px-3 py-2 text-right font-medium">CO₂ (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filtered.slice(0, 10).map((a) => (
                        <tr key={a.id} className="hover:bg-muted/20">
                          <td className="px-3 py-2 text-muted-foreground">{formatDate(a.created_at)}</td>
                          <td className="px-3 py-2">{categoryLabel(a.category)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{a.green_score}</td>
                          <td className="px-3 py-2 text-right">{a.co2e != null ? formatNumber(a.co2e) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length > 10 && (
                  <p className="text-center text-xs text-muted-foreground">
                    Showing 10 of {filtered.length} entries. Full report will include all data.
                  </p>
                )}
              </div>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
