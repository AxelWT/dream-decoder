import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';

const pageTitles: Record<string, string> = {
  '/': '首页',
  '/record': '记录梦境',
  '/analyze': 'AI 解构',
  '/timeline': '梦境时间线',
};

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading } = useAuth(true);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dream-purple to-dream-blue animate-pulse" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  const title = pageTitles[location.pathname] || '梦境解构师';

  return (
    <div className="min-h-screen bg-night-950 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
