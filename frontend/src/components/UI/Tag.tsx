import { motion } from 'framer-motion';

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'emotion' | 'scene' | 'school';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-night-700/50 text-gray-300 border-night-600',
  emotion: 'bg-dream-purple/10 text-dream-purple border-dream-purple/30',
  scene: 'bg-dream-blue/10 text-dream-blue border-dream-blue/30',
  school: 'bg-dream-cyan/10 text-dream-cyan border-dream-cyan/30',
};

const selectedStyles = {
  default: 'bg-dream-purple/30 text-white border-dream-purple/50',
  emotion: 'bg-dream-purple/30 text-white border-dream-purple/50',
  scene: 'bg-dream-blue/30 text-white border-dream-blue/50',
  school: 'bg-dream-cyan/30 text-white border-dream-cyan/50',
};

export function Tag({ label, selected = false, onClick, variant = 'default', size = 'sm' }: TagProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const style = selected ? selectedStyles[variant] : variantStyles[variant];

  if (onClick) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
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
