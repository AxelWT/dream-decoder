import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { AnxietyCurve } from '../components/Analytics/AnxietyCurve';
import { ThemeCloud } from '../components/Analytics/ThemeCloud';
import { StatsCards, DreamTypeDistribution, TopEmotions } from '../components/Analytics/StatsCards';
import {
  getAnxietyCurve, getThemeCloud, getInsightStats,
  type AnxietyCurveResponse, type ThemeCloudResponse, type InsightStats,
} from '../services/insights';

const DAYS_OPTIONS = [
  { value: 7, label: '7天' },
  { value: 30, label: '30天' },
  { value: 90, label: '90天' },
];

export function Insights() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [anxiety, setAnxiety] = useState<AnxietyCurveResponse | null>(null);
  const [themes, setThemes] = useState<ThemeCloudResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTimeData();
  }, [days]);

  async function loadData() {
    try {
      const [s, a, t] = await Promise.all([
        getInsightStats(),
        getAnxietyCurve(days),
        getThemeCloud(days),
      ]);
      setStats(s);
      setAnxiety(a);
      setThemes(t);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTimeData() {
    try {
      const [a, t] = await Promise.all([
        getAnxietyCurve(days),
        getThemeCloud(days),
      ]);
      setAnxiety(a);
      setThemes(t);
    } catch (err) {
      console.error('Failed to load time data:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-dream-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">数据洞察</h1>
            <p className="text-sm text-gray-400">探索你的梦境模式与情绪趋势</p>
          </div>
          <div className="flex items-center gap-1 bg-night-800 rounded-lg p-1">
            {DAYS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  days === opt.value
                    ? 'bg-dream-purple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Anxiety curve */}
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">潜意识焦虑曲线</h2>
          <AnxietyCurve dataPoints={anxiety?.dataPoints || []} days={days} />
        </Card>

        {/* Theme cloud & breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card>
            <ThemeCloud title="情绪标签" items={themes?.emotions || []} />
          </Card>
          <Card>
            <ThemeCloud title="场景标签" items={themes?.scenes || []} />
          </Card>
        </div>

        {/* More stats */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <Card>
              <TopEmotions stats={stats} />
            </Card>
            <Card>
              <DreamTypeDistribution stats={stats} />
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}
