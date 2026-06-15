/**
 * ChatPanel - AI 对话面板组件
 * 
 * 职责：
 * - 提供与 AI 梦境分析师的对话交互界面
 * - 支持心理学派选择，不同学派提供不同的分析视角
 * - 处理消息发送、接收和流式内容实时展示
 * - 提供快捷问题卡片引导用户开始对话
 * - 自动滚动到最新消息
 * - 支持根据 dreamId 或 sessionId 加载历史会话
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../UI/Button';
import { MessageBubble } from './MessageBubble';
import { SchoolSelector } from './SchoolSelector';
import { useChatStore } from '../../stores/chatStore';
import type { Message, PsychologySchool } from '../../types';
import { SCHOOL_LABELS } from '../../types';

/** ChatPanel 组件的 Props 接口定义 */
interface ChatPanelProps {
  /** 关联的梦境记录 ID，可选，用于绑定对话与特定梦境 */
  dreamId?: string;
  /** 会话 ID，可选，传入时加载该会话的历史消息 */
  sessionId?: string;
}

/** 快捷问题列表，引导用户快速开始对话 */
const QUICK_QUESTIONS = [
  '帮我分析这个梦的象征意义',
  '这个梦和我的情绪有什么关系',
  '这个梦境反复出现是什么原因',
  '从不同学派角度如何解读这个梦',
];

export function ChatPanel({ dreamId, sessionId }: ChatPanelProps) {
  /** 用户输入的消息文本 */
  const [input, setInput] = useState('');
  /** 心理学派选择器的展开/收起状态 */
  const [showSchoolSelector, setShowSchoolSelector] = useState(true);
  /** 消息列表底部的引用，用于自动滚动 */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  /** 输入框的引用，用于发送消息后自动聚焦 */
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** 从聊天状态管理中解构所需的数据和方法 */
  const {
    messages,         // 历史消息列表
    isStreaming,      // 是否正在流式接收 AI 回复
    streamingContent, // 当前流式回复的内容
    selectedSchool,   // 当前选中的心理学派
    setSchool,        // 设置心理学派
    sendMessage,      // 发送消息方法
    fetchSession,     // 获取会话历史
    clearCurrent,     // 清空当前会话
  } = useChatStore();

  /**
   * 会话加载副作用
   * 当 sessionId 存在时加载对应会话的历史消息，否则清空当前会话
   * 组件卸载时清空会话数据
   */
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      clearCurrent();
    }
    return () => clearCurrent();
  }, [sessionId]);

  /**
   * 自动滚动到底部
   * 当消息列表或流式内容更新时，自动滚动到最新消息
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  /**
   * 发送消息处理函数
   * 支持传入快捷问题文本，或使用输入框内容
   * 发送后清空输入框并重新聚焦
   */
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

  /**
   * 输入框键盘事件处理
   * Enter 键发送消息，Shift+Enter 换行
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * 构建显示用消息列表
   * 将历史消息与正在流式输出的内容合并，实现实时展示效果
   */
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
      {/* 心理学派选择器切换栏 */}
      <div className="px-4 py-3 border-b border-night-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">分析视角：</span>
          {/* 点击当前学派名称切换选择器展开/收起 */}
          <button
            onClick={() => setShowSchoolSelector(!showSchoolSelector)}
            className="text-sm text-dream-purple hover:text-dream-purple/80 transition-colors font-medium"
          >
            {SCHOOL_LABELS[selectedSchool]}
          </button>
        </div>
        {/* 展开/收起箭头图标 */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${showSchoolSelector ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 心理学派选择器面板，带动画展开/收起效果 */}
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

      {/* 消息展示区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 无消息时的空状态提示 */}
        {displayMessages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* 空状态图标 */}
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

            {/* 快捷问题卡片，点击即可发送预设问题 */}
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
            {/* 消息列表，使用 MessageBubble 组件渲染每条消息 */}
            {displayMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={msg.id === 'streaming'}
              />
            ))}
            {/* 滚动锚点，用于自动滚动定位 */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 底部消息输入区域 */}
      <div className="p-4 border-t border-night-700/50 bg-night-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            {/* 多行文本输入框，支持自动增高（最大 120px） */}
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
            {/* 发送按钮，流式接收中显示加载状态 */}
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              isLoading={isStreaming}
              size="lg"
              className="shrink-0"
            >
              {/* 非加载状态显示发送图标 */}
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
