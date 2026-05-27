import type { InsightStats } from '../../services/insights';
import { DREAM_TYPE_LABELS } from '../../types';

interface Props {
  stats: InsightStats;
}

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: '总梦境数',
      value: stats.totalDreams,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      gradient: 'from-dream-purple to-dream-blue',
    },
    {
      label: '本月记录',
      value: stats.monthlyDreams,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-dream-blue to-dream-cyan',
    },
    {
      label: '本周记录',
      value: stats.weeklyDreams,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-dream-cyan to-dream-purple',
    },
    {
      label: '平均焦虑',
      value: stats.avgAnxiety !== null ? stats.avgAnxiety : '--',
      suffix: stats.avgAnxiety !== null ? '' : '',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-4">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-3`}>
            {card.icon}
          </div>
          <p className="text-2xl font-bold text-white">
            {card.value}{card.suffix ?? ''}
          </p>
          <p className="text-xs text-gray-400 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

export function DreamTypeDistribution({ stats }: Props) {
  const types = stats.dreamTypes;
  if (types.length === 0) return null;

  const total = types.reduce((sum, t) => sum + t.count, 0);

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-3">梦境类型分布</h3>
      <div className="space-y-2">
        {types.map((t) => {
          const pct = Math.round((t.count / total) * 100);
          const label = DREAM_TYPE_LABELS[t.type as keyof typeof DREAM_TYPE_LABELS] || t.type;
          return (
            <div key={t.type}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">{label}</span>
                <span className="text-gray-500">{t.count} ({pct}%)</span>
              </div>
              <div className="h-2 bg-night-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-dream-purple to-dream-blue rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopEmotions({ stats }: Props) {
  if (stats.topEmotions.length === 0) return null;

  const max = stats.topEmotions[0].count;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-3">高频情绪 TOP5</h3>
      <div className="space-y-2">
        {stats.topEmotions.map((e, i) => {
          const pct = Math.round((e.count / max) * 100);
          const colors = ['bg-dream-purple', 'bg-dream-blue', 'bg-dream-cyan', 'bg-yellow-500', 'bg-pink-500'];
          return (
            <div key={e.emotion} className="flex items-center gap-3">
              <span className="w-5 text-xs text-gray-500 text-right">{i + 1}</span>
              <span className="w-16 text-sm text-gray-300">{e.emotion}</span>
              <div className="flex-1 h-2 bg-night-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[i]} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-6 text-right">{e.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
