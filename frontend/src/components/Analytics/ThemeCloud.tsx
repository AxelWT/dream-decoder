import type { ThemeItem } from '../../services/insights';

interface Props {
  title: string;
  items: ThemeItem[];
  colorClass?: string;
}

const COLOR_CLASSES = [
  'bg-dream-purple/20 text-dream-purple border-dream-purple/30',
  'bg-dream-blue/20 text-dream-blue border-dream-blue/30',
  'bg-dream-cyan/20 text-dream-cyan border-dream-cyan/30',
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'bg-green-500/20 text-green-400 border-green-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-red-500/20 text-red-400 border-red-500/30',
];

export function ThemeCloud({ title, items }: Props) {
  if (items.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
        <p className="text-sm text-gray-600">暂无数据</p>
      </div>
    );
  }

  const maxCount = items[0].count;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => {
          const ratio = item.count / maxCount;
          const sizeClass = ratio > 0.8
            ? 'text-base px-4 py-1.5'
            : ratio > 0.5
              ? 'text-sm px-3 py-1'
              : 'text-xs px-2.5 py-0.5';
          const color = COLOR_CLASSES[i % COLOR_CLASSES.length];

          return (
            <span
              key={item.name}
              className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${sizeClass} ${color}`}
            >
              {item.name}
              <span className="opacity-60 text-xs">{item.count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
