import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: 'purple' | 'blue' | 'none';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, glow = 'none', className = '', children, ...props }, ref) => {
    const glowClass = glow === 'purple' ? 'glow-purple' : glow === 'blue' ? 'glow-blue' : '';

    const Wrapper = hoverable ? motion.div : 'div';
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
