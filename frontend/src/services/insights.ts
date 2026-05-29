import { api } from './api';

export interface AnxietyDataPoint {
  date: string;
  score: number;
  dreamId: string;
  title: string | null;
  emotions: string[];
}

export interface AnxietyCurveResponse {
  days: number;
  dataPoints: AnxietyDataPoint[];
}

export interface ThemeItem {
  name: string;
  count: number;
}

export interface ThemeCloudResponse {
  emotions: ThemeItem[];
  scenes: ThemeItem[];
  types: ThemeItem[];
  totalDreams: number;
}

export interface InsightStats {
  totalDreams: number;
  monthlyDreams: number;
  weeklyDreams: number;
  topEmotions: { emotion: string; count: number }[];
  topScenes: { scene: string; count: number }[];
  dreamTypes: { type: string; count: number }[];
  avgAnxiety: number | null;
}

export async function getAnxietyCurve(days = 30) {
  return api.get<AnxietyCurveResponse>(`/insights/anxiety-curve?days=${days}`);
}

export async function getThemeCloud(days = 30) {
  return api.get<ThemeCloudResponse>(`/insights/theme-cloud?days=${days}`);
}

export async function getInsightStats() {
  return api.get<InsightStats>('/insights/stats');
}

export async function backfillAnxiety() {
  return api.post<{ processed: number; total: number }>('/insights/backfill-anxiety');
}
