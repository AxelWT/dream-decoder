/**
 * @file Tag.tsx
 * @description 通用标签组件，支持多种变体（默认/情绪/场景/学派）、选中状态、
 *              两种尺寸。有点击回调时渲染为按钮，否则渲染为纯展示 span。
 */
import { motion } from 'framer-motion';

/** 标签组件的 Props 定义 */
interface TagProps {
  /** 标签文本 */
  label: string;
  /** 是否选中 */
  selected?: boolean;
  /** 点击回调（传入时渲染为可点击按钮） */
  onClick?: () => void;
  /** 标签变体样式 */
  variant?: 'default' | 'emotion' | 'scene' | 'school';
  /** 标签尺寸 */
  size?: 'sm' | 'md';
}

/** 各变体的默认（未选中）样式映射 */
const variantStyles = {
  default: 'bg-night-700/50 text-gray-300 border-night-600',
  emotion: 'bg-dream-purple/10 text-dream-purple border-dream-purple/30',
  scene: 'bg-dream-blue/10 text-dream-blue border-dream-blue/30',
  school: 'bg-dream-cyan/10 text-dream-cyan border-dream-cyan/30',
};

/** 各变体的选中状态样式映射 */
const selectedStyles = {
  default: 'bg-dream-purple/30 text-white border-dream-purple/50',
  emotion: 'bg-dream-purple/30 text-white border-dream-purple/50',
  scene: 'bg-dream-blue/30 text-white border-dream-blue/50',
  school: 'bg-dream-cyan/30 text-white border-dream-cyan/50',
};

export function Tag({ label, selected = false, onClick, variant = 'default', size = 'sm' }: TagProps) {
  // 根据尺寸计算 padding 和字号
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  // 根据选中状态选择样式
  const style = selected ? selectedStyles[variant] : variantStyles[variant];

  // 有点击回调时渲染为按钮（可交互）
  if (onClick) {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }} // 点击缩放反馈
        onClick={onClick}
        className={`
          inline-flex items-center rounded-lg border font-medium transition-all duration-200
          ${style} ${sizeClass}
        `}
      >
        {label}
      </motion.button>
    );
  }

  // 无点击回调时渲染为纯展示标签
  return (
    <span
      className={`
        inline-flex items-center rounded-lg border font-medium
        ${style} ${sizeClass}
      `}
    >
      {label}
    </span>
  );
}
