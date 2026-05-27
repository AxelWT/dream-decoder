import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../UI/Card';
import { Tag } from '../UI/Tag';
import type { Dream } from '../../types';
import { CLARITY_LABELS, DREAM_TYPE_LABELS } from '../../types';

interface DreamListProps {
  dreams: Dream[];
  onDelete?: (id: string) => void;
}

export function DreamList({ dreams, onDelete }: DreamListProps) {
  const navigate = useNavigate();

  if (dreams.length === 0) {
    return (
      <Card className="text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-night-700/50 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </div>
        <p className="text-gray-400 text-lg mb-2">梦境还是空的</p>
        <p className="text-gray-500 text-sm">开始记录你的第一个梦吧</p>
      </Card>
    );
  }

  // Group dreams by date
  const grouped = dreams.reduce((acc, dream) => {
    const date = new Date(dream.recordedAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(dream);
    return acc;
  }, {} as Record<string, Dream[]>);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([date, dateDreams]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-dream-purple/50" />
            {date}
          </h3>
          <div className="space-y-3">
            {dateDreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/dream/${dream.id}`)}
                  className="relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-medium text-white truncate mb-1">
                        {dream.title || '无标题梦境'}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {dream.content}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {dream.emotions.slice(0, 4).map((emotion) => (
                          <Tag key={emotion} label={emotion} variant="emotion" />
                        ))}
                        {dream.clarity && (
                          <Tag label={CLARITY_LABELS[dream.clarity]} />
                        )}
                        {dream.dreamType && (
                          <Tag label={DREAM_TYPE_LABELS[dream.dreamType]} />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(dream.recordedAt).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {dream.sessions && dream.sessions.length > 0 && (
                        <span className="text-xs text-dream-cyan bg-dream-cyan/10 px-2 py-0.5 rounded-md">
                          已解构
                        </span>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(dream.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
