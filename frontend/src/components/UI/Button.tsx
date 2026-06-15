/**
 * @file Button.tsx
 * @description 通用按钮组件，支持多种变体（primary/secondary/ghost/danger）、
 *              多种尺寸（sm/md/lg）以及加载状态。基于 framer-motion 实现点击反馈动画。
 */
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

/** 按钮组件的 Props 定义，扩展原生 button 属性 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体样式 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否处于加载状态（显示旋转图标并禁用按钮） */
  isLoading?: boolean;
}

/** 各变体对应的 Tailwind 样式映射 */
const variants = {
  primary: 'bg-gradient-to-r from-dream-purple to-dream-blue text-white hover:opacity-90 glow-purple',
  secondary: 'bg-night-700 text-gray-200 hover:bg-night-600 border border-night-600',
  ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-night-800',
  danger: 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30',
};

/** 各尺寸对应的 Tailwind 样式映射 */
const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

/** 使用 forwardRef 转发 ref，支持外部获取按钮 DOM 引用 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }} // 点击时微缩放反馈
        className={`
          inline-flex items-center justify-center font-medium transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        disabled={disabled || isLoading} // 加载状态也禁用按钮
        {...(props as any)}
      >
        {/* 加载中的旋转图标 */}
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
