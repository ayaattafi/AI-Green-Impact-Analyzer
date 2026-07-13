export function formatNumber(value: number, decimals = 1): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatCompact(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return '0';
  return Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
}

export function formatCurrency(value: number): string {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-lime-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-lime-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getMetricValue(outputs: Record<string, unknown>, key: string): number {
  const value = outputs[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    carbon: 'Carbon / Transport',
    water: 'Water',
    energy: 'Energy',
    food: 'Food',
    waste: 'Waste',
    electronics: 'Electronics',
  };
  return labels[category] ?? category;
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}
