import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useDreamStore } from '../stores/dreamStore';
import { useAuthStore } from '../stores/authStore';

export function Home() {
  const navigate = useNavigate();
  const { dreams, fetchDreams } = useDreamStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDreams(1);
  }, []);

  const recentDreams = dreams.slice(0, 3);

  const quickActions = [
    {
      title: '记录梦境',
      description: '捕捉醒来时的梦境记忆',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      path: '/record',
      gradient: 'from-dream-purple to-dream-blue',
    },
    {
      title: 'AI 解构',
      description: '让 AI 帮你解析梦境含义',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      path: '/analyze',
      gradient: 'from-dream-blue to-dream-cyan',
    },
    {
      title: '梦境时间线',
      description: '回顾你的梦境旅程',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/timeline',
      gradient: 'from-dream-cyan to-dream-purple',
    },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold mb-3">
          <span className="text-gradient">你好，{user?.nickname || '梦旅人'}</span>
        </h1>
        <p className="text-gray-400 text-lg">今晚的梦境，等待你的记录与探索</p>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hoverable onClick={() => navigate(action.path)} className="h-full">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-4`}>
                {action.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent dreams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">最近的梦境</h2>
          {dreams.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/timeline')}>
              查看全部
            </Button>
          )}
        </div>

        {recentDreams.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-night-700 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">还没有记录过梦境</p>
            <Button onClick={() => navigate('/record')}>记录第一个梦</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentDreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable onClick={() => navigate(`/dream/${dream.id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {dream.title || '无标题梦境'}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {dream.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {dream.emotions.slice(0, 3).map((emotion) => (
                          <span
                            key={emotion}
                            className="text-xs px-2 py-0.5 rounded-md bg-dream-purple/10 text-dream-purple"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                      {new Date(dream.recordedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
