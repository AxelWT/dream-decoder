/**
 * 梦境时间线页（Timeline）
 *
 * 页面职责：以时间线列表形式展示用户的所有梦境记录，支持分页加载。
 * 功能概述：
 *   - 展示梦境列表（通过 DreamList 组件渲染）
 *   - 支持删除梦境
 *   - 分页加载更多
 *   - 加载状态展示
 */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DreamList } from '../components/Dream/DreamList';
import { Button } from '../components/UI/Button';
import { useDreamStore } from '../stores/dreamStore';

export function Timeline() {
  const { dreams, fetchDreams, removeDream, isLoading, page, totalPages } = useDreamStore();

  /* 页面加载时获取第一页梦境数据 */
  useEffect(() => {
    fetchDreams(1);
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 页面标题和梦境统计 */}
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

        {/* 加载状态 */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 mx-auto border-2 border-dream-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">加载中...</p>
          </div>
        ) : (
          <>
            {/* 梦境列表，支持删除操作 */}
            <DreamList dreams={dreams} onDelete={removeDream} />

            {/* 分页加载更多按钮 */}
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
