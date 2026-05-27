import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { BackgroundForm } from '../components/Profile/BackgroundForm';

export function Profile() {
  const { user } = useAuthStore();
  const { fetchProfile, fetchStats, stats, isLoading } = useProfileStore();

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dream-purple to-dream-blue flex items-center justify-center text-2xl font-bold text-white">
            {user?.nickname?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.nickname || '用户'}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-xs text-gray-500 mt-1">
                注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-night-800/50 rounded-2xl p-5 border border-night-700/50 text-center">
            <p className="text-3xl font-bold text-dream-purple">{stats.totalDreams}</p>
            <p className="text-sm text-gray-400 mt-1">梦境总数</p>
          </div>
          <div className="bg-night-800/50 rounded-2xl p-5 border border-night-700/50 text-center">
            <p className="text-3xl font-bold text-dream-blue">{stats.monthlyDreams}</p>
            <p className="text-sm text-gray-400 mt-1">本月记录</p>
          </div>
          <div className="bg-night-800/50 rounded-2xl p-5 border border-night-700/50 text-center">
            <p className="text-3xl font-bold text-dream-teal">
              {stats.topEmotions[0]?.emotion || '-'}
            </p>
            <p className="text-sm text-gray-400 mt-1">最常见情绪</p>
          </div>
        </motion.div>
      )}

      {/* Background Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">个人背景档案</h2>
        <p className="text-sm text-gray-400 mb-6">
          完善你的个人背景信息，AI 解梦时会参考这些信息提供更贴合你的分析。
        </p>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <BackgroundForm />
        )}
      </motion.div>
    </div>
  );
}
