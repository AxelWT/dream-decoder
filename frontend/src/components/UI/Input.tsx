/**
 * @file Input.tsx
 * @description 通用输入框组件，包含 Input（单行输入）和 Textarea（多行输入）两个组件。
 *              支持 label 标签和 error 错误提示，采用暗色主题样式。
 */
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

/** 单行输入框的 Props 定义，扩展原生 input 属性 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 输入框标签文本 */
  label?: string;
  /** 错误提示信息 */
  error?: string;
}

/** 多行文本输入框的 Props 定义，扩展原生 textarea 属性 */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 输入框标签文本 */
  label?: string;
  /** 错误提示信息 */
  error?: string;
}

/** 单行输入框组件，支持 label 和 error 展示 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {/* 标签（可选） */}
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-night-800/70 border border-night-600 rounded-xl px-4 py-2.5
            text-gray-100 placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-dream-purple/50 focus:border-dream-purple/50
            transition-all duration-200
            ${error ? 'border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {/* 错误提示（可选） */}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

/** 多行文本输入框组件，支持 label 和 error 展示 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {/* 标签（可选） */}
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full bg-night-800/70 border border-night-600 rounded-xl px-4 py-3
            text-gray-100 placeholder-gray-500 resize-none
            focus:outline-none focus:ring-2 focus:ring-dream-purple/50 focus:border-dream-purple/50
            transition-all duration-200
            ${error ? 'border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {/* 错误提示（可选） */}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
