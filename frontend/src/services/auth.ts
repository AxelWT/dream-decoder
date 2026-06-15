/**
 * @file auth.ts
 * @description 认证服务模块，封装所有与用户认证相关的 API 请求，
 *              包括验证码发送/校验、密码登录/注册、获取当前用户、密码重置等。
 */
import { api } from './api';
import type { User } from '../types';

/** 认证响应数据结构（登录/注册成功后返回） */
export interface AuthResponse {
  /** JWT token */
  token: string;
  /** 用户信息 */
  user: User;
}

/** 发送邮箱验证码（用于登录/注册） */
export async function sendVerificationCode(email: string) {
  return api.post<{ success: boolean; message: string }>('/auth/send-code', { email });
}

/** 校验验证码并登录 */
export async function verifyCode(email: string, code: string) {
  const result = await api.post<AuthResponse>('/auth/verify', { email, code });
  return result;
}

/** 使用邮箱+密码登录 */
export async function loginWithPassword(email: string, password: string) {
  return api.post<AuthResponse>('/auth/login-password', { email, password });
}

/** 注册新用户（邮箱+密码+昵称+验证码） */
export async function registerUser(email: string, password: string, nickname: string | undefined, code: string) {
  return api.post<AuthResponse>('/auth/register', { email, password, nickname, code });
}

/** 获取当前登录用户信息（根据 token） */
export async function getCurrentUser() {
  return api.get<User>('/auth/me');
}

/** 发送密码重置验证码 */
export async function sendResetCode(email: string) {
  return api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
}

/** 重置密码（邮箱+验证码+新密码） */
export async function resetPassword(email: string, code: string, newPassword: string) {
  return api.post<{ success: boolean; message: string }>('/auth/reset-password', { email, code, newPassword });
}
