import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DreamList } from '../components/Dream/DreamList';
import { Button } from '../components/UI/Button';
import { useDreamStore } from '../stores/dreamStore';

export function Timeline() {
  const { dreams, fetchDreams, removeDream, isLoading, page, totalPages } = useDreamStore();

  useEffect(() => {
    fetchDreams(1);
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">梦境时间线</h1>
            <p className="text-sm text-gray-400">回顾你的梦境旅程</p>
          </div>
          {dreams.length > 0 && (
            <span className="text-sm text-gray-500">
              共 {dreams.length} 个梦境
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 mx-auto border-2 border-dream-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">加载中...</p>
          </div>
        ) : (
          <>
            <DreamList dreams={dreams} onDelete={removeDream} />

            {page < totalPages && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={() => fetchDreams(page + 1)}
                >
                  加载更多
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
