/**
 * SchoolSelector - 心理学派选择器组件
 * 
 * 职责：
 * - 展示所有可选的心理学分析学派
 * - 以网格卡片形式呈现，每个学派包含图标、名称和简介
 * - 支持单选模式，选中状态高亮显示
 * - 选中后调用回调通知父组件更新分析视角
 */
import { motion } from 'framer-motion';
import type { PsychologySchool } from '../../types';
import { SCHOOL_LABELS, SCHOOL_DESCRIPTIONS } from '../../types';

/** SchoolSelector 组件的 Props 接口定义 */
interface SchoolSelectorProps {
  /** 当前选中的心理学派 */
  selected: PsychologySchool;
  /** 选择学派的回调函数 */
  onSelect: (school: PsychologySchool) => void;
}

/** 可选的心理学派列表，按展示顺序排列 */
const schools: PsychologySchool[] = ['integrated', 'jung', 'freud', 'cognitive', 'zhougong'];

/** 各心理学派对应的图标映射 */
const schoolIcons: Record<PsychologySchool, string> = {
  integrated: '🔮',  // 综合分析
  jung: '🌙',        // 荣格分析
  freud: '🧠',       // 弗洛伊德精神分析
  cognitive: '💡',    // 认知行为
  zhougong: '📜',    // 周公解梦
};

export function SchoolSelector({ selected, onSelect }: SchoolSelectorProps) {
  return (
    {/* 两列网格布局展示所有学派选项 */}
    <div className="grid grid-cols-2 gap-2">
      {schools.map((school) => (
        <motion.button
          key={school}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(school)}
          className={`
            p-3 rounded-xl border text-left transition-all duration-200
            ${selected === school
              ? 'bg-dream-purple/15 border-dream-purple/30 text-white'
              : 'bg-night-800/50 border-night-700/50 text-gray-400 hover:border-night-600 hover:text-gray-300'
            }
          `}
        >
          {/* 学派图标和名称 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{schoolIcons[school]}</span>
            <span className="text-sm font-medium">{SCHOOL_LABELS[school]}</span>
          </div>
          {/* 学派简介 */}
          <p className="text-xs opacity-70">{SCHOOL_DESCRIPTIONS[school]}</p>
        </motion.button>
      ))}
    </div>
  );
}
