/**
 * @file Card.tsx
 * @description 通用卡片容器组件，支持 hover 动画和光晕效果。
 *              基于 glass-card 样式实现毛玻璃质感。
 */
import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

/** 卡片组件的 Props 定义 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否启用 hover 上浮动画效果 */
  hoverable?: boolean;
  /** 光晕效果类型 */
  glow?: 'purple' | 'blue' | 'none';
}

/** 使用 forwardRef 转发 ref，支持外部获取卡片 DOM 引用 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, glow = 'none', className = '', children, ...props }, ref) => {
    // 根据光晕类型映射 CSS 类名
    const glowClass = glow === 'purple' ? 'glow-purple' : glow === 'blue' ? 'glow-blue' : '';

    // hoverable 时使用 motion.div 以支持动画，否则使用普通 div
    const Wrapper = hoverable ? motion.div : 'div';
    // hover 时的缩放和上浮动画参数
    const motionProps = hoverable
      ? { whileHover: { scale: 1.01, y: -2 }, transition: { duration: 0.2 } }
      : {};

    return (
      <Wrapper
        ref={ref}
        className={`glass-card p-5 ${hoverable ? 'glass-card-hover cursor-pointer' : ''} ${glowClass} ${className}`}
        {...motionProps}
        {...(props as any)}
      >
        {children}
      </Wrapper>
    );
  }
);

Card.displayName = 'Card';
