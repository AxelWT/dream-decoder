import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { AnxietyCurve } from '../components/Analytics/AnxietyCurve';
import { ThemeCloud } from '../components/Analytics/ThemeCloud';
import { StatsCards, DreamTypeDistribution, TopEmotions } from '../components/Analytics/StatsCards';
import {
  getAnxietyCurve, getThemeCloud, getInsightStats, backfillAnxiety,
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
  const [showInfo, setShowInfo] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    }
    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInfo]);

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

  async function handleBackfill() {
    setBackfilling(true);
    try {
      await backfillAnxiety();
      const a = await getAnxietyCurve(days);
      setAnxiety(a);
    } catch (err) {
      console.error('Failed to backfill anxiety scores:', err);
    } finally {
      setBackfilling(false);
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
          <div className="relative flex items-center gap-2 mb-4" ref={infoRef}>
            <h2 className="text-lg font-semibold text-white">潜意识焦虑曲线</h2>
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="relative group"
              aria-label="查看说明"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-gray-400 group-hover:text-white transition-colors">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
                <text x="9" y="13" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">i</text>
              </svg>
            </button>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 z-50 w-80 p-4 rounded-xl bg-night-800/90 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <p className="font-medium text-white mb-1">焦虑曲线</p>
                    <p>基于你记录的梦境，AI 自动评估每次梦境的焦虑程度并生成分数，折线图展示焦虑指数随时间的变化趋势。</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">焦虑指数（0-10 分）</p>
                    <ul className="space-y-1 text-xs">
                      <li>0-2：平静、愉快的梦境</li>
                      <li>3-4：略有不安但整体平和</li>
                      <li>5-6：中等焦虑，有压力或紧张元素</li>
                      <li>7-8：高焦虑，噩梦、追赶、坠落等</li>
                      <li>9-10：极度焦虑，恐惧、窒息、无法逃脱</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">均值线</p>
                    <p>虚线标注所有记录的平均焦虑水平，帮助你识别高峰期。</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <AnxietyCurve dataPoints={anxiety?.dataPoints || []} days={days} />
          {(!anxiety?.dataPoints || anxiety.dataPoints.length === 0) && stats && stats.totalDreams > 0 && (
            <div className="mt-4 text-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackfill}
                isLoading={backfilling}
              >
                生成焦虑指数
              </Button>
              <p className="text-xs text-gray-500 mt-2">为已有梦境记录生成焦虑指数</p>
            </div>
          )}
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
