/**
 * @file analysis.ts
 * @description AI 解构/分析服务模块，封装梦境解构对话的流式聊天、
 *              会话列表查询和删除等 API 请求。
 */
import { api } from './api';
import type { ChatSession, PsychologySchool } from '../types';

/**
 * 流式聊天请求（SSE），返回 AsyncGenerator 逐块输出 AI 回复
 * @param params.message - 用户发送的消息
 * @param params.sessionId - 已有会话 ID（可选，不传则创建新会话）
 * @param params.dreamId - 关联的梦境 ID（可选）
 * @param params.school - 使用的心理学派
 */
export function streamChat(params: {
  message: string;
  sessionId?: string;
  dreamId?: string;
  school: PsychologySchool;
}) {
  return api.streamPost('/analysis/chat', params);
}

/** 获取当前用户的所有解构对话列表 */
export async function getSessions() {
  return api.get<ChatSession[]>('/analysis/sessions');
}

/** 获取单个解构对话详情（含消息记录） */
export async function getSession(id: string) {
  return api.get<ChatSession>(`/analysis/sessions/${id}`);
}

/** 删除解构对话 */
export async function deleteSession(id: string) {
  return api.delete<{ success: boolean }>(`/analysis/sessions/${id}`);
}
