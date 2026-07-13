import { supabase } from '@/lib/supabase';
import type { AnalysisRecord, CalculatorCategory } from '@/types';

export async function fetchAnalyses(category?: CalculatorCategory): Promise<AnalysisRecord[]> {
  let query = supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AnalysisRecord[];
}

export async function saveAnalysis(record: {
  category: CalculatorCategory;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  ai_recommendation: string;
  green_score: number;
  co2e: number | null;
  notes?: string;
}): Promise<AnalysisRecord> {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      category: record.category,
      inputs: record.inputs,
      outputs: record.outputs,
      ai_recommendation: record.ai_recommendation,
      green_score: record.green_score,
      co2e: record.co2e,
      notes: record.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as AnalysisRecord;
}

export async function deleteAnalysis(id: string): Promise<void> {
  const { error } = await supabase.from('analyses').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteAnalyses(ids: string[]): Promise<void> {
  const { error } = await supabase.from('analyses').delete().in('id', ids);
  if (error) throw error;
}

export async function updateAnalysisNotes(id: string, notes: string): Promise<void> {
  const { error } = await supabase.from('analyses').update({ notes }).eq('id', id);
  if (error) throw error;
}
