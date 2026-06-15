/**
 * @file chatStore.ts
 * @description 聊天/解构对话状态管理 Store，使用 Zustand 管理 AI 对话的会话列表、
 *              消息记录和流式响应状态。支持切换心理学派、发送消息（SSE 流式）、
 *              管理会话等操作。
 */
import { create } from 'zustand';
import type { ChatSession, Message, PsychologySchool } from '../types';
import { streamChat, getSessions, getSession, deleteSession } from '../services/analysis';

/** 聊天 Store 的状态和操作接口 */
interface ChatStore {
  /** 会话列表 */
  sessions: ChatSession[];
  /** 当前查看的会话 */
  currentSession: ChatSession | null;
  /** 当前会话的消息列表 */
  messages: Message[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否正在接收流式响应 */
  isStreaming: boolean;
  /** 当前流式响应的累积内容 */
  streamingContent: string;
  /** 当前选中的心理学派 */
  selectedSchool: PsychologySchool;

  /** 切换心理学派 */
  setSchool: (school: PsychologySchool) => void;
  /** 获取会话列表 */
  fetchSessions: () => Promise<void>;
  /** 获取单个会话详情（含消息记录） */
  fetchSession: (id: string) => Promise<void>;
  /** 发送消息并接收流式回复 */
  sendMessage: (params: {
    message: string;
    dreamId?: string;
    sessionId?: string;
  }) => Promise<string>;
  /** 删除会话 */
  removeSession: (id: string) => Promise<void>;
  /** 清除当前会话状态 */
  clearCurrent: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  selectedSchool: 'integrated', // 默认使用综合分析

  /** 切换心理学派 */
  setSchool: (school) => set({ selectedSchool: school }),

  /** 获取所有会话列表 */
  fetchSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await getSessions();
      set({ sessions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 获取单个会话详情，加载消息和学派 */
  fetchSession: async (id: string) => {
    set({ isLoading: true });
    try {
      const session = await getSession(id);
      set({
        currentSession: session,
        messages: session.messages || [],
        selectedSchool: session.school as PsychologySchool,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 发送消息：立即在 UI 显示用户消息，然后流式接收 AI 回复 */
  sendMessage: async ({ message, dreamId, sessionId }) => {
    const { selectedSchool } = get();

    // 立即在 UI 添加用户消息
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      sessionId: sessionId || '',
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingContent: '',
    }));

    let fullContent = '';
    let newSessionId = '';

    try {
      // 调用流式聊天 API
      const stream = streamChat({
        message,
        dreamId,
        sessionId,
        school: selectedSchool,
      });

      // 逐块接收并更新流式内容
      for await (const chunk of stream) {
        // 检查是否包含会话 ID 标记（新会话创建时返回）
        const sessionMatch = chunk.match(/\[SESSION_ID:(.+?)\]/);
        if (sessionMatch) {
          newSessionId = sessionMatch[1];
          fullContent = fullContent.replace(/\[SESSION_ID:(.+?)\]/, '');
          continue;
        }

        fullContent += chunk;
        set({ streamingContent: fullContent });
      }
    } catch (err: any) {
      // 流式请求失败时显示错误信息
      fullContent = `抱歉，AI 分析遇到问题：${err.message}`;
      set({ streamingContent: fullContent });
    }

    // 流式接收完成后，添加助手消息到消息列表
    const assistantMsg: Message = {
      id: `temp-${Date.now()}-assistant`,
      sessionId: newSessionId || sessionId || '',
      role: 'assistant',
      content: fullContent,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, assistantMsg],
      isStreaming: false,
      streamingContent: '',
    }));

    // 如果是新创建的会话，刷新会话列表
    if (newSessionId && !sessionId) {
      get().fetchSessions();
    }

    // 返回会话 ID（供页面跳转等使用）
    return newSessionId || sessionId || '';
  },

  /** 删除指定会话 */
  removeSession: async (id: string) => {
    await deleteSession(id);
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
  },

  /** 清除当前会话和消息 */
  clearCurrent: () => set({ currentSession: null, messages: [] }),
}));
