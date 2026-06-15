/**
 * MainLayout - 应用主布局组件
 * 
 * 职责：
 * - 提供整体页面骨架，包含侧边栏、顶部栏和内容区域
 * - 管理侧边栏的展开/收起状态（移动端响应式）
 * - 根据当前路由自动生成页面标题
 * - 处理用户认证加载状态的全局等待界面
 * - 通过 React Router 的 Outlet 渲染子路由内容
 */
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';

/** 路由路径与页面标题的映射表，用于在 Header 中显示当前页面名称 */
const pageTitles: Record<string, string> = {
  '/': '首页',
  '/record': '记录梦境',
  '/analyze': 'AI 解构',
  '/timeline': '梦境时间线',
};

export function MainLayout() {
  /** 控制移动端侧边栏是否展开 */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  /** 用户认证加载状态，传入 true 表示需要验证登录态 */
  const { isLoading } = useAuth(true);
  /** 当前路由信息，用于获取路径和监听路由变化 */
  const location = useLocation();

  /**
   * 路由变化时自动关闭侧边栏（移动端体验优化）
   * 当用户在侧边栏中点击导航链接后，侧边栏应自动收起
   */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /** 认证信息加载中时，显示全局加载占位界面 */
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

  /** 根据当前路径获取页面标题，未匹配时使用默认标题 */
  const title = pageTitles[location.pathname] || '梦境解构师';

  return (
    // 整体布局容器：左侧侧边栏 + 右侧内容区
    <div className="min-h-screen bg-night-950 flex">
      {/* 侧边栏组件，控制展开/收起 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 右侧主内容区域 */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* 顶部导航栏，包含菜单按钮和页面标题 */}
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        {/* 页面主体内容，通过 Outlet 渲染子路由匹配的组件 */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
