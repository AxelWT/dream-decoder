import { api } from './api';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export async function sendVerificationCode(email: string) {
  return api.post<{ success: boolean; message: string }>('/auth/send-code', { email });
}

export async function verifyCode(email: string, code: string) {
  const result = await api.post<AuthResponse>('/auth/verify', { email, code });
  return result;
}

export async function loginWithPassword(email: string, password: string) {
  return api.post<AuthResponse>('/auth/login-password', { email, password });
}

export async function registerUser(email: string, password: string, nickname?: string) {
  return api.post<AuthResponse>('/auth/register', { email, password, nickname });
}

export async function getCurrentUser() {
  return api.get<User>('/auth/me');
}
