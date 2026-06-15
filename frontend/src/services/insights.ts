/**
 * @file insights.ts
 * @description 洞察/数据分析服务模块，封装焦虑曲线、主题云、统计概览等数据 API 请求。
 *              同时导出相关数据类型定义，供组件使用。
 */
import { api } from './api';

/** 焦虑指数数据点 */
export interface AnxietyDataPoint {
  /** 日期（ISO 格式字符串） */
  date: string;
  /** 焦虑分数（0-10） */
  score: number;
  /** 关联的梦境 ID */
  dreamId: string;
  /** 梦境标题 */
  title: string | null;
  /** 梦境情绪标签列表 */
  emotions: string[];
}

/** 焦虑曲线接口响应 */
export interface AnxietyCurveResponse {
  /** 查询的天数范围 */
  days: number;
  /** 焦虑数据点列表 */
  dataPoints: AnxietyDataPoint[];
}

/** 主题词项（名称+频次） */
export interface ThemeItem {
  /** 主题词名称 */
  name: string;
  /** 出现次数 */
  count: number;
}

/** 主题云接口响应 */
export interface ThemeCloudResponse {
  /** 高频情绪词 */
  emotions: ThemeItem[];
  /** 高频场景词 */
  scenes: ThemeItem[];
  /** 高频梦境类型 */
  types: ThemeItem[];
  /** 参与统计的梦境总数 */
  totalDreams: number;
}

/** 统计概览数据 */
export interface InsightStats {
  /** 总梦境数 */
  totalDreams: number;
  /** 本月记录数 */
  monthlyDreams: number;
  /** 本周记录数 */
  weeklyDreams: number;
  /** 高频情绪排名 */
  topEmotions: { emotion: string; count: number }[];
  /** 高频场景排名 */
  topScenes: { scene: string; count: number }[];
  /** 梦境类型分布 */
  dreamTypes: { type: string; count: number }[];
  /** 平均焦虑指数（无数据时为 null） */
  avgAnxiety: number | null;
}

/** 获取焦虑曲线数据 */
export async function getAnxietyCurve(days = 30) {
  return api.get<AnxietyCurveResponse>(`/insights/anxiety-curve?days=${days}`);
}

/** 获取主题云数据 */
export async function getThemeCloud(days = 30) {
  return api.get<ThemeCloudResponse>(`/insights/theme-cloud?days=${days}`);
}

/** 获取统计概览数据 */
export async function getInsightStats() {
  return api.get<InsightStats>('/insights/stats');
}

/** 手动回填焦虑指数（对历史梦境批量计算） */
export async function backfillAnxiety() {
  return api.post<{ processed: number; total: number }>('/insights/backfill-anxiety');
}
