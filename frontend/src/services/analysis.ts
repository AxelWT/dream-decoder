import { api } from './api';
import type { ChatSession, PsychologySchool } from '../types';

export function streamChat(params: {
  message: string;
  sessionId?: string;
  dreamId?: string;
  school: PsychologySchool;
}) {
  return api.streamPost('/analysis/chat', params);
}

export async function getSessions() {
  return api.get<ChatSession[]>('/analysis/sessions');
}

export async function getSession(id: string) {
  return api.get<ChatSession>(`/analysis/sessions/${id}`);
}

export async function deleteSession(id: string) {
  return api.delete<{ success: boolean }>(`/analysis/sessions/${id}`);
}
