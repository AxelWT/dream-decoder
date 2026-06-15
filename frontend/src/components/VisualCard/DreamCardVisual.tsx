/**
 * @file DreamCardVisual.tsx
 * @description 梦境卡片视觉展示组件，根据卡片风格渲染不同配色和装饰的视觉卡片。
 *              支持完整模式和紧凑模式，完整模式包含符号、主题、情绪、引言等所有信息；
 *              紧凑模式仅展示核心摘要，用于画廊列表。
 */
import { useState } from 'react';
import type { DreamCard } from '../../services/cards';
import { format, parseISO } from 'date-fns';
import { SCHOOL_LABELS, type PsychologySchool } from '../../types';
import { shareDream } from '../../utils/share';

/** 组件 Props 定义 */
interface Props {
  /** 梦境卡片数据 */
  card: DreamCard;
  /** 是否使用紧凑布局（画廊列表用） */
  compact?: boolean;
}

/** 各风格的视觉配置（背景渐变、边框、强调色、光晕、图标） */
const STYLE_CONFIGS = {
  mystic: {
    bg: 'from-indigo-950 via-purple-950 to-slate-950',
    border: 'border-purple-500/30',
    accent: 'text-purple-300',
    glow: 'shadow-purple-500/20',
    icon: '☽',
  },
  watercolor: {
    bg: 'from-sky-950 via-cyan-950 to-teal-950',
    border: 'border-cyan-500/30',
    accent: 'text-cyan-300',
    glow: 'shadow-cyan-500/20',
    icon: '❋',
  },
  minimal: {
    bg: 'from-gray-950 via-slate-950 to-gray-950',
    border: 'border-gray-500/30',
    accent: 'text-gray-300',
    glow: 'shadow-gray-500/20',
    icon: '○',
  },
  surreal: {
    bg: 'from-rose-950 via-pink-950 to-fuchsia-950',
    border: 'border-pink-500/30',
    accent: 'text-pink-300',
    glow: 'shadow-pink-500/20',
    icon: '◉',
  },
};

export function DreamCardVisual({ card, compact = false }: Props) {
  // 分享链接是否已复制到剪贴板
  const [copied, setCopied] = useState(false);
  // 根据卡片风格获取对应的视觉配置，默认使用 mystic 风格
  const style = STYLE_CONFIGS[card.style as keyof typeof STYLE_CONFIGS] || STYLE_CONFIGS.mystic;
  // 格式化日期字符串
  const dateStr = card.dream?.recordedAt
    ? format(parseISO(card.dream.recordedAt), 'yyyy.MM.dd')
    : format(parseISO(card.createdAt), 'yyyy.MM.dd');

  // 心理学派中文标签
  const schoolLabel = card.school
    ? SCHOOL_LABELS[card.school as PsychologySchool] || card.school
    : '';

  // 紧凑模式：用于画廊列表，仅展示标题和部分符号
  if (compact) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border} p-5 shadow-lg ${style.glow} aspect-[3/4] flex flex-col`}>
        {/* 背景装饰光斑 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-8 left-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
        </div>

        <div className="relative flex-1 flex flex-col">
          <div className="text-2xl mb-2">{style.icon}</div>
          <h3 className={`text-lg font-semibold ${style.accent} line-clamp-2 mb-3`}>
            {card.title || '无标题'}
          </h3>

          {/* 符号标签（紧凑模式最多4个） */}
          {card.symbols.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {card.symbols.slice(0, 4).map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <p className="text-xs text-white/40">{dateStr}</p>
          </div>
        </div>
      </div>
    );
  }

  // 完整模式：展示所有卡片信息
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border} p-8 shadow-lg ${style.glow}`}>
      {/* 背景装饰光斑 */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-6 right-6 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-12 left-8 w-36 h-36 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/3 blur-3xl" />
      </div>

      <div className="relative flex flex-col min-h-[400px]">
        {/* 头部：图标和品牌名 */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">{style.icon}</span>
          <span className={`text-sm font-medium ${style.accent} opacity-60`}>梦境解构师</span>
        </div>

        {/* 卡片标题 */}
        <h2 className={`text-2xl font-bold ${style.accent} mb-4`}>
          {card.title || '潜意识的低语'}
        </h2>

        {/* 核心符号标签 */}
        {card.symbols.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-2">核心符号</p>
            <div className="flex flex-wrap gap-2">
              {card.symbols.map((s) => (
                <span key={s} className="text-sm px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 潜意识主题 */}
        {card.theme && (
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-1">潜意识主题</p>
            <p className="text-sm text-white/70">{card.theme}</p>
          </div>
        )}

        {/* 情绪基调 */}
        {card.emotions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-1">情绪基调</p>
            <p className="text-sm text-white/70">{card.emotions.join(' · ')}</p>
          </div>
        )}

        {/* 引言/语录 */}
        {card.quote && (
          <div className="my-auto py-4">
            <blockquote className={`text-sm italic ${style.accent} opacity-80 leading-relaxed border-l-2 ${style.border} pl-4`}>
              "{card.quote}"
            </blockquote>
          </div>
        )}

        {/* 底部：学派视角 + 分享 + 日期 */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
          <div>
            {schoolLabel && (
              <span className="text-xs text-white/40">—— {schoolLabel}视角</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* 分享按钮 */}
            <button
              onClick={async () => {
                const ok = await shareDream(card.title || '', card.dreamId);
                if (ok) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
              title="分享"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? '已复制' : '分享'}
            </button>
            {/* 日期和品牌 */}
            <div className="text-right">
              <p className="text-xs text-white/40">{dateStr}</p>
              <p className="text-xs text-white/30">DreamDecoder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
