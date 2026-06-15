/**
 * @file cards.ts
 * @description 梦境卡片服务模块，封装梦境视觉卡片的生成、查询和删除等 API 请求。
 *              同时导出 DreamCard 数据类型，供组件使用。
 */
import { api } from './api';

/** 梦境卡片数据结构 */
export interface DreamCard {
  /** 卡片 ID */
  id: string;
  /** 所属用户 ID */
  userId: string;
  /** 关联的梦境 ID */
  dreamId: string;
  /** 卡片风格（mystic / watercolor / minimal / surreal） */
  style: string;
  /** 卡片标题 */
  title: string | null;
  /** 核心符号列表 */
  symbols: string[];
  /** 潜意识主题 */
  theme: string | null;
  /** 引言/语录 */
  quote: string | null;
  /** 使用的心理学派 */
  school: string | null;
  /** 情绪基调列表 */
  emotions: string[];
  /** 创建时间 */
  createdAt: string;
  /** 关联的梦境简要信息（可选） */
  dream?: {
    id: string;
    title: string | null;
    recordedAt?: string;
    content?: string;
  };
}

/** 分页卡片列表响应 */
export interface PaginatedCards {
  /** 卡片列表 */
  cards: DreamCard[];
  /** 总数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 总页数 */
  totalPages: number;
}

/** 生成梦境视觉卡片 */
export async function generateCard(dreamId: string, style?: string) {
  return api.post<DreamCard>('/cards/generate', { dreamId, style });
}

/** 获取卡片列表（分页） */
export async function getCards(page = 1, limit = 20) {
  return api.get<PaginatedCards>(`/cards?page=${page}&limit=${limit}`);
}

/** 获取单张卡片详情 */
export async function getCard(id: string) {
  return api.get<DreamCard>(`/cards/${id}`);
}

/** 删除卡片 */
export async function deleteCard(id: string) {
  return api.delete<{ success: boolean }>(`/cards/${id}`);
}
