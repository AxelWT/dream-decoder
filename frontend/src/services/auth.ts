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

export async function registerUser(email: string, password: string, nickname: string | undefined, code: string) {
  return api.post<AuthResponse>('/auth/register', { email, password, nickname, code });
}

export async function getCurrentUser() {
  return api.get<User>('/auth/me');
}

export async function sendResetCode(email: string) {
  return api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  return api.post<{ success: boolean; message: string }>('/auth/reset-password', { email, code, newPassword });
}
