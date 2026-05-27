import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../UI/Button';
import { MessageBubble } from './MessageBubble';
import { SchoolSelector } from './SchoolSelector';
import { useChatStore } from '../../stores/chatStore';
import type { Message, PsychologySchool } from '../../types';
import { SCHOOL_LABELS } from '../../types';

interface ChatPanelProps {
  dreamId?: string;
  sessionId?: string;
}

const QUICK_QUESTIONS = [
  '帮我分析这个梦的象征意义',
  '这个梦和我的情绪有什么关系',
  '这个梦境反复出现是什么原因',
  '从不同学派角度如何解读这个梦',
];

export function ChatPanel({ dreamId, sessionId }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showSchoolSelector, setShowSchoolSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isStreaming,
    streamingContent,
    selectedSchool,
    setSchool,
    sendMessage,
    fetchSession,
    clearCurrent,
  } = useChatStore();

  // Load session if sessionId provided
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      clearCurrent();
    }
    return () => clearCurrent();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || isStreaming) return;

    setInput('');
    inputRef.current?.focus();

    await sendMessage({
      message,
      dreamId,
      sessionId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Build display messages including streaming content
  const displayMessages: Message[] = [...messages];
  if (isStreaming && streamingContent) {
    displayMessages.push({
      id: 'streaming',
      sessionId: '',
      role: 'assistant',
      content: streamingContent,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* School selector toggle */}
      <div className="px-4 py-3 border-b border-night-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">分析视角：</span>
          <button
            onClick={() => setShowSchoolSelector(!showSchoolSelector)}
            className="text-sm text-dream-purple hover:text-dream-purple/80 transition-colors font-medium"
          >
            {SCHOOL_LABELS[selectedSchool]}
          </button>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${showSchoolSelector ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <AnimatePresence>
        {showSchoolSelector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-night-700/50"
          >
            <div className="p-4">
              <SchoolSelector
                selected={selectedSchool}
                onSelect={(school) => {
                  setSchool(school);
                  setShowSchoolSelector(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {displayMessages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dream-purple/20 to-dream-blue/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-dream-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">开始解构梦境</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              {dreamId
                ? '描述你的梦境，AI 分析师会引导你深入探索梦境的含义'
                : '选择一个梦境记录，或直接开始对话'}
            </p>

            {/* Quick question cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSend(question)}
                  className="p-3 text-left rounded-xl border border-night-600 hover:border-dream-purple/40 hover:bg-dream-purple/5 transition-all group"
                >
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {displayMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={msg.id === 'streaming'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-night-700/50 bg-night-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你的梦境，或向 AI 提问..."
              rows={1}
              className="flex-1 bg-night-800/70 border border-night-600 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-dream-purple/50 focus:border-dream-purple/50 transition-all"
              style={{ maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              isLoading={isStreaming}
              size="lg"
              className="shrink-0"
            >
              {!isStreaming && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
