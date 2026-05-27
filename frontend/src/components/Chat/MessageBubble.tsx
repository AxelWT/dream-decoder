import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-gradient-to-r from-dream-purple to-dream-blue text-white'
            : 'bg-night-800/70 border border-night-700/50 text-gray-200'
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-night-700/30">
            <div className="w-5 h-5 rounded-md bg-dream-purple/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-dream-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xs text-dream-purple font-medium">梦境分析师</span>
          </div>
        )}

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
