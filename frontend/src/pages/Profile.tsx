import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { useDreamStore } from '../stores/dreamStore';
import { BackgroundForm } from '../components/Profile/BackgroundForm';
import { uploadAvatar } from '../services/profile';
import { exportAsJSON, exportAsCSV } from '../utils/export';

export function Profile() {
  const { user, fetchUser } = useAuthStore();
  const { fetchProfile, fetchStats, stats, isLoading } = useProfileStore();
  const { dreams, fetchDreams } = useDreamStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchDreams();
  }, [fetchProfile, fetchStats, fetchDreams]);

  const handleExport = async (format: 'json' | 'csv') => {
    if (dreams.length === 0) {
      alert('暂无梦境数据可导出');
      return;
    }
    setExporting(true);
    try {
      // Fetch all dreams (may need multiple pages)
      const { getDreams } = await import('../services/dreams');
      const allDreams: typeof dreams = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const result = await getDreams(page, 50);
        allDreams.push(...result.dreams);
        hasMore = page < result.totalPages;
        page++;
      }

      if (format === 'json') {
        exportAsJSON(allDreams);
      } else {
        exportAsCSV(allDreams);
      }
    } catch (err: any) {
      alert(err.message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await uploadAvatar(reader.result as string);
          await fetchUser();
        } catch (err: any) {
          alert(err.message || '上传头像失败');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        alert('读取文件失败');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50"
      >
        <div className="flex items-center gap-4">
          <div
            className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-dream-purple to-dream-blue flex items-center justify-center text-2xl font-bold text-white overflow-hidden cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.nickname?.[0] || user?.email?.[0]?.toUpperCase() || '?'}</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
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

      {/* Data Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50"
      >
        <h2 className="text-xl font-semibold text-white mb-2">数据导出</h2>
        <p className="text-sm text-gray-400 mb-4">
          导出你的所有梦境记录，支持 JSON 和 CSV 格式。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-night-700 hover:bg-night-600 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {exporting ? '导出中...' : '导出 JSON'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-night-700 hover:bg-night-600 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {exporting ? '导出中...' : '导出 CSV'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
