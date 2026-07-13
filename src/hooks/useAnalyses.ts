import { useCallback, useEffect, useState } from 'react';
import { fetchAnalyses, deleteAnalysis as deleteSvc } from '@/services/analysisService';
import type { AnalysisRecord, CalculatorCategory } from '@/types';

export function useAnalyses(category?: CalculatorCategory) {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnalyses(category);
      setAnalyses(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analyses');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await deleteSvc(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { analyses, loading, error, reload: load, remove };
}
