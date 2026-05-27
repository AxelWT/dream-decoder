import { create } from 'zustand';
import type { ChatSession, Message, PsychologySchool } from '../types';
import { streamChat, getSessions, getSession, deleteSession } from '../services/analysis';

interface ChatStore {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  selectedSchool: PsychologySchool;

  setSchool: (school: PsychologySchool) => void;
  fetchSessions: () => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  sendMessage: (params: {
    message: string;
    dreamId?: string;
    sessionId?: string;
  }) => Promise<string>;
  removeSession: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  selectedSchool: 'integrated',

  setSchool: (school) => set({ selectedSchool: school }),

  fetchSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await getSessions();
      set({ sessions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

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

  sendMessage: async ({ message, dreamId, sessionId }) => {
    const { selectedSchool } = get();

    // Add user message to UI immediately
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
      const stream = streamChat({
        message,
        dreamId,
        sessionId,
        school: selectedSchool,
      });

      for await (const chunk of stream) {
        // Check for session ID marker
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
      fullContent = `抱歉，AI 分析遇到问题：${err.message}`;
      set({ streamingContent: fullContent });
    }

    // Add assistant message
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

    // Update session info if new session was created
    if (newSessionId && !sessionId) {
      get().fetchSessions();
    }

    return newSessionId || sessionId || '';
  },

  removeSession: async (id: string) => {
    await deleteSession(id);
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
  },

  clearCurrent: () => set({ currentSession: null, messages: [] }),
}));
