/**
 * @file AnxietyCurve.tsx
 * @description 焦虑指数曲线图组件，基于 Recharts 的 LineChart 展示用户梦境焦虑指数随时间的变化趋势。
 *              包含均值参考线、暗色主题配色和中文化 Tooltip。
 */
import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { AnxietyDataPoint } from '../../services/insights';

/** 组件 Props 定义 */
interface Props {
  /** 焦虑指数数据点数组 */
  dataPoints: AnxietyDataPoint[];
  /** 查询的时间跨度（天数） */
  days: number;
}

export function AnxietyCurve({ dataPoints, days }: Props) {
  // 使用 useMemo 缓存图表数据，添加格式化的日期标签
  const chartData = useMemo(() => {
    return dataPoints.map((d) => ({
      ...d,
      dateLabel: format(parseISO(d.date), days <= 7 ? 'MM/dd' : 'MM/dd', { locale: zhCN }),
    }));
  }, [dataPoints, days]);

  // 无数据时的空状态提示
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p>暂无焦虑指数数据</p>
          <p className="text-sm mt-1">记录更多梦境后将自动生成曲线</p>
        </div>
      </div>
    );
  }

  // 计算焦虑指数均值，用于绘制参考线
  const avg = chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          {/* 网格线 */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          {/* X 轴配置 */}
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          {/* Y 轴配置，范围 0-10 */}
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          {/* 悬浮提示框 */}
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '13px',
            }}
            formatter={(value) => [`${value}`, '焦虑指数']}
            labelFormatter={(label) => `日期: ${label}`}
          />
          {/* 均值参考线 */}
          <ReferenceLine
            y={avg}
            stroke="#c9b97a"
            strokeDasharray="4 4"
            label={{ value: `均值 ${avg.toFixed(0)}`, fill: '#c9b97a', fontSize: 11, position: 'right' }}
          />
          {/* 焦虑指数折线 */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }}
            activeDot={{ fill: '#a78bfa', r: 6, strokeWidth: 2, stroke: '#7c3aed' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
