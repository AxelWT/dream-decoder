import { motion } from 'framer-motion';
import type { PsychologySchool } from '../../types';
import { SCHOOL_LABELS, SCHOOL_DESCRIPTIONS } from '../../types';

interface SchoolSelectorProps {
  selected: PsychologySchool;
  onSelect: (school: PsychologySchool) => void;
}

const schools: PsychologySchool[] = ['integrated', 'jung', 'freud', 'cognitive'];

const schoolIcons: Record<PsychologySchool, string> = {
  integrated: '🔮',
  jung: '🌙',
  freud: '🧠',
  cognitive: '💡',
};

export function SchoolSelector({ selected, onSelect }: SchoolSelectorProps) {
  return (
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{schoolIcons[school]}</span>
            <span className="text-sm font-medium">{SCHOOL_LABELS[school]}</span>
          </div>
          <p className="text-xs opacity-70">{SCHOOL_DESCRIPTIONS[school]}</p>
        </motion.button>
      ))}
    </div>
  );
}
