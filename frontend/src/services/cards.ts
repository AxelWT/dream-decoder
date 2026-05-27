import { api } from './api';

export interface DreamCard {
  id: string;
  userId: string;
  dreamId: string;
  style: string;
  title: string | null;
  symbols: string[];
  theme: string | null;
  quote: string | null;
  school: string | null;
  emotions: string[];
  createdAt: string;
  dream?: {
    id: string;
    title: string | null;
    recordedAt?: string;
    content?: string;
  };
}

export interface PaginatedCards {
  cards: DreamCard[];
  total: number;
  page: number;
  totalPages: number;
}

export async function generateCard(dreamId: string, style?: string) {
  return api.post<DreamCard>('/cards/generate', { dreamId, style });
}

export async function getCards(page = 1, limit = 20) {
  return api.get<PaginatedCards>(`/cards?page=${page}&limit=${limit}`);
}

export async function getCard(id: string) {
  return api.get<DreamCard>(`/cards/${id}`);
}

export async function deleteCard(id: string) {
  return api.delete<{ success: boolean }>(`/cards/${id}`);
}
