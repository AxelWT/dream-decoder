import type { Dream } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAsJSON(dreams: Dream[], filename = 'dreams-export.json') {
  const data = dreams.map((d) => ({
    title: d.title,
    content: d.content,
    emotions: d.emotions,
    clarity: d.clarity,
    dreamType: d.dreamType,
    scenes: d.scenes,
    aiSummary: d.aiSummary,
    anxietyScore: d.anxietyScore,
    recordedAt: d.recordedAt,
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportAsCSV(dreams: Dream[], filename = 'dreams-export.csv') {
  const headers = ['标题', '内容', '情绪', '清晰度', '梦境类型', '场景', 'AI摘要', '焦虑指数', '记录时间'];
  const rows = dreams.map((d) => [
    escapeCSV(d.title || ''),
    escapeCSV(d.content),
    escapeCSV(d.emotions.join('、')),
    escapeCSV(d.clarity || ''),
    escapeCSV(d.dreamType || ''),
    escapeCSV(d.scenes.join('、')),
    escapeCSV(d.aiSummary || ''),
    d.anxietyScore?.toString() || '',
    escapeCSV(d.recordedAt),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}
