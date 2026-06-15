/**
 * @file export.ts
 * @description 数据导出工具模块，提供梦境数据的 JSON 和 CSV 格式导出功能。
 *              CSV 导出支持中文（UTF-8 BOM），自动处理特殊字符转义。
 */
import type { Dream } from '../types';

/**
 * 通用文件下载方法
 * @param blob - 要下载的 Blob 数据
 * @param filename - 下载文件名
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url); // 释放内存
}

/**
 * 将梦境数据导出为 JSON 文件
 * @param dreams - 要导出的梦境数组
 * @param filename - 导出文件名，默认 'dreams-export.json'
 */
export function exportAsJSON(dreams: Dream[], filename = 'dreams-export.json') {
  // 仅导出核心字段，过滤掉 ID 等内部数据
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

/**
 * CSV 特殊字符转义（逗号、引号、换行符）
 * @param value - 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 将梦境数据导出为 CSV 文件
 * @param dreams - 要导出的梦境数组
 * @param filename - 导出文件名，默认 'dreams-export.csv'
 */
export function exportAsCSV(dreams: Dream[], filename = 'dreams-export.csv') {
  // CSV 表头
  const headers = ['标题', '内容', '情绪', '清晰度', '梦境类型', '场景', 'AI摘要', '焦虑指数', '记录时间'];
  // 逐行转换数据
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

  // 拼接 CSV 内容，添加 BOM 头以确保中文编码正确
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}
