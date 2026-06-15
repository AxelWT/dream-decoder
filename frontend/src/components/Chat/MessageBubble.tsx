/**
 * MessageBubble - 聊天消息气泡组件
 * 
 * 职责：
 * - 渲染单条聊天消息（用户消息或 AI 回复）
 * - 用户消息使用渐变紫蓝色背景，AI 回复使用深色背景
 * - AI 回复支持 Markdown 渲染，用户消息保持纯文本
 * - 流式输出时显示打字光标动画
 * - AI 回复头部显示"梦境分析师"标识
 */
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../types';

/** MessageBubble 组件的 Props 接口定义 */
interface MessageBubbleProps {
  /** 消息对象，包含角色、内容等信息 */
  message: Message;
  /** 是否正在流式输出中，用于显示打字光标 */
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  /** 判断是否为用户发送的消息，决定气泡样式和对齐方向 */
  const isUser = message.role === 'user';

  return (
    /* 消息容器，使用 framer-motion 淡入动画，用户消息靠右，AI 回复靠左 */
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* 消息气泡，根据角色应用不同样式 */}
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-gradient-to-r from-dream-purple to-dream-blue text-white'
            : 'bg-night-800/70 border border-night-700/50 text-gray-200'
          }
        `}
      >
        {/* AI 回复头部：分析师标识 */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-night-700/30">
            {/* 分析师图标 */}
            <div className="w-5 h-5 rounded-md bg-dream-purple/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-dream-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xs text-dream-purple font-medium">梦境分析师</span>
          </div>
        )}

        {/* 消息内容区域：用户消息纯文本，AI 回复 Markdown 渲染 */}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className={`markdown-body text-sm ${isStreaming ? 'typing-cursor' : ''}`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
