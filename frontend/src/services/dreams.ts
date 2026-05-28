import { api } from './api';
import type { Dream, DreamFormData, PaginatedResponse } from '../types';

export async function createDream(data: DreamFormData) {
  return api.post<Dream>('/dreams', data);
}

export async function getDreams(page = 1, limit = 20) {
  return api.get<PaginatedResponse<Dream>>(`/dreams?page=${page}&limit=${limit}`);
}

export async function getDream(id: string) {
  return api.get<Dream>(`/dreams/${id}`);
}

export async function updateDream(id: string, data: Partial<DreamFormData>) {
  return api.put<Dream>(`/dreams/${id}`, data);
}

export async function deleteDream(id: string) {
  return api.delete<{ success: boolean }>(`/dreams/${id}`);
}
