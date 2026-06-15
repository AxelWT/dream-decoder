/**
 * @file CardGenerator.tsx
 * @description 梦境卡片生成器组件，提供4种卡片风格供用户选择，
 *              点击生成按钮后调用后端 API 生成梦境视觉卡片。
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../UI/Button';
import { generateCard, type DreamCard } from '../../services/cards';

/** 可选的卡片风格列表 */
const STYLES = [
  { value: 'mystic', label: '深色神秘', desc: '深蓝紫色，星空月光', icon: '☽' },
  { value: 'watercolor', label: '清新水彩', desc: '浅色晕染，柔和清新', icon: '❋' },
  { value: 'minimal', label: '极简文字', desc: '纯文字排版，简洁有力', icon: '○' },
  { value: 'surreal', label: '超现实', desc: '梦幻粉紫，超现实感', icon: '◉' },
];

/** 组件 Props 定义 */
interface Props {
  /** 关联的梦境 ID */
  dreamId: string;
  /** 卡片生成成功后的回调，返回生成的卡片数据 */
  onGenerated: (card: DreamCard) => void;
}

export function CardGenerator({ dreamId, onGenerated }: Props) {
  // 当前选中的卡片风格
  const [style, setStyle] = useState('mystic');
  // 是否正在生成中
  const [generating, setGenerating] = useState(false);
  // 错误信息
  const [error, setError] = useState('');

  /** 生成卡片处理：调用 API 生成指定风格的梦境卡片 */
  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const card = await generateCard(dreamId, style);
      onGenerated(card);
    } catch (err: any) {
      setError(err.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400">选择卡片风格</h3>
      {/* 风格选择网格 */}
      <div className="grid grid-cols-2 gap-3">
        {STYLES.map((s) => (
          <motion.button
            key={s.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStyle(s.value)}
            className={`p-4 rounded-xl border text-left transition-all ${
              style === s.value
                ? 'border-dream-purple bg-dream-purple/10'
                : 'border-night-700 bg-night-800/50 hover:border-night-600'
            }`}
          >
            <span className="text-2xl">{s.icon}</span>
            <p className="text-sm font-medium text-white mt-2">{s.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* 生成按钮 */}
      <Button onClick={handleGenerate} disabled={generating} className="w-full">
        {generating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            生成中...
          </span>
        ) : (
          '生成梦境卡片'
        )}
      </Button>
    </div>
  );
}
