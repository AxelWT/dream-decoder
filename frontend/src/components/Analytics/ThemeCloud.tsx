/**
 * @file ThemeCloud.tsx
 * @description 主题云/标签云组件，以不同大小和颜色的标签展示高频主题词。
 *              标签大小根据出现频次动态计算，频次越高标签越大。
 */
import type { ThemeItem } from '../../services/insights';

/** 组件 Props 定义 */
interface Props {
  /** 主题云标题 */
  title: string;
  /** 主题词列表 */
  items: ThemeItem[];
  /** 自定义颜色类名（可选，未使用） */
  colorClass?: string;
}

/** 预定义的标签颜色列表，循环使用 */
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
  // 无数据时的空状态
  if (items.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
        <p className="text-sm text-gray-600">暂无数据</p>
      </div>
    );
  }

  // 最高频次，用于计算相对大小
  const maxCount = items[0].count;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => {
          // 计算频次比例，用于决定标签大小
          const ratio = item.count / maxCount;
          // 根据比例分三档大小
          const sizeClass = ratio > 0.8
            ? 'text-base px-4 py-1.5'
            : ratio > 0.5
              ? 'text-sm px-3 py-1'
              : 'text-xs px-2.5 py-0.5';
          // 循环使用颜色列表
          const color = COLOR_CLASSES[i % COLOR_CLASSES.length];

          return (
            <span
              key={item.name}
              className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${sizeClass} ${color}`}
            >
              {item.name}
              {/* 显示频次数字 */}
              <span className="opacity-60 text-xs">{item.count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
