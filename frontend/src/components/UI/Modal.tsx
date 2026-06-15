/**
 * @file Modal.tsx
 * @description 通用模态框组件，支持标题、关闭按钮、不同尺寸。
 *              打开时锁定页面滚动，使用 framer-motion 实现淡入/缩放动画。
 */
import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** 模态框组件的 Props 定义 */
interface ModalProps {
  /** 是否打开模态框 */
  isOpen: boolean;
  /** 关闭模态框的回调 */
  onClose: () => void;
  /** 模态框标题（可选，不传则不显示标题栏和关闭按钮） */
  title?: string;
  /** 模态框内容 */
  children: ReactNode;
  /** 模态框尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

/** 各尺寸对应的最大宽度样式 */
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // 打开时禁止背景滚动，关闭时恢复
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 半透明遮罩层，点击关闭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* 模态框内容区域 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizeClasses[size]} glass-card p-6`}
          >
            {/* 标题栏和关闭按钮 */}
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
