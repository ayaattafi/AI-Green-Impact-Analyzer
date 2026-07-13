import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas-pro';
import type { AnalysisRecord } from '@/types';
import { formatDate, formatNumber, categoryLabel } from '@/lib/format';

export interface ReportStats {
  totalCo2: number;
  avgScore: number;
  best: number;
  worst: number;
  count: number;
}

export interface ReportSections {
  summary: boolean;
  details: boolean;
  recommendations: boolean;
  charts: boolean;
}

const PRIMARY = '#10b981';
const INK = '#1a2e1a';
const MUTED = '#6b7280';
const PAGE_WIDTH = 595.28; // A4 pt
const MARGIN = 40;

function buildSummaryText(analyses: AnalysisRecord[], stats: ReportStats): string {
  const byCategory = new Map<string, number[]>();
  for (const a of analyses) {
    if (!byCategory.has(a.category)) byCategory.set(a.category, []);
    byCategory.get(a.category)!.push(a.green_score);
  }
  const ranked = [...byCategory.entries()]
    .map(([cat, scores]) => ({ cat, avg: scores.reduce((s, x) => s + x, 0) / scores.length }))
    .sort((a, b) => b.avg - a.avg);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  let text = `This report covers ${stats.count} environmental ${stats.count === 1 ? 'analysis' : 'analyses'} `
    + `with an average green score of ${stats.avgScore}/100. Total tracked emissions: ${formatNumber(stats.totalCo2)} kg CO2e. `
    + `Scores ranged from ${stats.worst} to ${stats.best}.`;
  if (best && worst && best.cat !== worst.cat) {
    text += ` ${categoryLabel(best.cat)} is the strongest-performing category (avg ${Math.round(best.avg)}/100), `
      + `while ${categoryLabel(worst.cat)} has the most room for improvement (avg ${Math.round(worst.avg)}/100).`;
  }
  return text;
}

async function captureChart(elementId: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  const el = document.getElementById(elementId);
  if (!el) return null;
  const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
  return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
}

export async function buildPdfReport(
  analyses: AnalysisRecord[],
  stats: ReportStats,
  sections: ReportSections,
  chartElementId?: string
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = MARGIN;

  // Header
  doc.setFillColor(PRIMARY);
  doc.rect(MARGIN, y, 4, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(PRIMARY);
  doc.text('GREENLY', MARGIN + 14, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(`Generated ${formatDate(new Date())}`, PAGE_WIDTH - MARGIN, y + 20, { align: 'right' });
  y += 44;

  doc.setDrawColor(PRIMARY);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(INK);
  doc.text('Sustainability Impact Report', MARGIN, y);
  y += 28;

  // KPI boxes
  const kpis = [
    { label: 'Total Analyses', value: String(stats.count) },
    { label: 'Average Score', value: `${stats.avgScore}/100` },
    { label: 'Total CO2e (kg)', value: formatNumber(stats.totalCo2) },
    { label: 'Best Score', value: String(stats.best) },
  ];
  const boxWidth = (PAGE_WIDTH - MARGIN * 2 - 3 * 10) / 4;
  kpis.forEach((k, i) => {
    const x = MARGIN + i * (boxWidth + 10);
    doc.setFillColor('#f0fdf4');
    doc.roundedRect(x, y, boxWidth, 50, 6, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(PRIMARY);
    doc.text(k.value, x + 10, y + 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(k.label, x + 10, y + 38);
  });
  y += 70;

  if (sections.summary) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(PRIMARY);
    doc.text('Executive Summary', MARGIN, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(INK);
    const summaryText = buildSummaryText(analyses, stats);
    const lines = doc.splitTextToSize(summaryText, PAGE_WIDTH - MARGIN * 2);
    doc.text(lines, MARGIN, y);
    y += lines.length * 13 + 16;
  }

  if (sections.charts && chartElementId) {
    const chart = await captureChart(chartElementId);
    if (chart) {
      const imgWidth = PAGE_WIDTH - MARGIN * 2;
      const imgHeight = (chart.height / chart.width) * imgWidth;
      if (y + imgHeight > 780) { doc.addPage(); y = MARGIN; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(PRIMARY);
      doc.text('Visual Overview', MARGIN, y);
      y += 12;
      doc.addImage(chart.dataUrl, 'PNG', MARGIN, y, imgWidth, imgHeight);
      y += imgHeight + 20;
    }
  }

  if (sections.details || sections.recommendations) {
    if (y > 700) { doc.addPage(); y = MARGIN; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(PRIMARY);
    doc.text('Detailed Breakdown', MARGIN, y);
    y += 10;

    const columns = ['Date', 'Category', 'Score', 'CO2e (kg)', ...(sections.recommendations ? ['AI Recommendation'] : [])];
    const rows = analyses.map((a) => [
      formatDate(a.created_at),
      categoryLabel(a.category),
      String(a.green_score),
      a.co2e != null ? formatNumber(a.co2e) : 'N/A',
      ...(sections.recommendations ? [a.ai_recommendation ?? ''] : []),
    ]);

    autoTable(doc, {
      startY: y + 6,
      head: [columns],
      body: rows,
      margin: { left: MARGIN, right: MARGIN },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [26, 46, 26] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: sections.recommendations ? { 4: { cellWidth: 200 } } : undefined,
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(
      `GREENLY — AI-Powered Sustainability Analyzer  •  Page ${i} of ${pageCount}`,
      PAGE_WIDTH / 2,
      820,
      { align: 'center' }
    );
  }

  return doc;
}
