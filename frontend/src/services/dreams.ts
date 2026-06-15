/**
 * @file dreams.ts
 * @description 梦境 CRUD 服务模块，封装梦境记录的创建、查询、更新和删除等 API 请求。
 */
import { api } from './api';
import type { Dream, DreamFormData, PaginatedResponse } from '../types';

/** 创建新的梦境记录 */
export async function createDream(data: DreamFormData) {
  return api.post<Dream>('/dreams', data);
}

/** 获取梦境列表（分页） */
export async function getDreams(page = 1, limit = 20) {
  return api.get<PaginatedResponse<Dream>>(`/dreams?page=${page}&limit=${limit}`);
}

/** 获取单个梦境详情 */
export async function getDream(id: string) {
  return api.get<Dream>(`/dreams/${id}`);
}

/** 更新梦境记录 */
export async function updateDream(id: string, data: Partial<DreamFormData>) {
  return api.put<Dream>(`/dreams/${id}`, data);
}

/** 删除梦境记录 */
export async function deleteDream(id: string) {
  return api.delete<{ success: boolean }>(`/dreams/${id}`);
}
