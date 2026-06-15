/**
 * Sidebar - 侧边导航栏组件
 * 
 * 职责：
 * - 提供应用主要功能的导航入口（首页、记录、解构、时间线等）
 * - 显示应用 Logo 和品牌信息
 * - 展示用户积分信息，免费用户显示升级入口
 * - 显示当前登录用户信息及退出登录按钮
 * - 支持移动端抽屉式弹出和桌面端固定展示两种模式
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { CreditsBadge } from '../UI/CreditsBadge';

/** 侧边栏导航项配置，定义每个导航项的路径、标签和图标 */
const navItems = [
  {
    path: '/',
    label: '首页',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/record',
    label: '记录梦境',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    path: '/analyze',
    label: 'AI 解构',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    path: '/timeline',
    label: '梦境时间线',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/insights',
    label: '数据洞察',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: '/gallery',
    label: '梦境画廊',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: '个人档案',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

/** Sidebar 组件的 Props 接口定义 */
interface SidebarProps {
  /** 侧边栏是否展开（移动端控制显隐） */
  isOpen: boolean;
  /** 关闭侧边栏的回调函数 */
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  /** 从认证状态管理中获取当前用户信息和退出登录方法 */
  const { user, logout } = useAuthStore();
  /** 路由导航实例，用于退出登录后跳转到登录页 */
  const navigate = useNavigate();

  /**
   * 处理退出登录
   * 清除用户登录状态并跳转到登录页面
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* 移动端遮罩层，点击可关闭侧边栏 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏主体，使用 framer-motion 实现滑入滑出动画 */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed left-0 top-0 bottom-0 w-[280px] bg-night-900/95 backdrop-blur-xl border-r border-night-700/50 z-50 flex flex-col lg:!translate-x-0 lg:static lg:z-auto"
      >
        {/* Logo 和品牌区域 */}
        <div className="p-6 border-b border-night-700/50">
          <div className="flex items-center gap-3">
            {/* 应用图标，渐变紫色到蓝色 + 发光效果 */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dream-purple to-dream-blue flex items-center justify-center glow-purple">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            {/* 品牌名称 */}
            <div>
              <h1 className="text-lg font-semibold text-white">梦境解构师</h1>
              <p className="text-xs text-gray-500">Dream Decoder</p>
            </div>
          </div>
        </div>

        {/* 导航链接列表 */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-dream-purple/15 text-dream-purple border border-dream-purple/20'
                    : 'text-gray-400 hover:text-white hover:bg-night-800'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 积分展示和升级入口 */}
        <div className="px-4 pb-2 space-y-2">
          {/* 积分徽章组件 */}
          <CreditsBadge />
          {/* 免费用户显示升级订阅入口 */}
          {user?.plan === 'FREE' && (
            <NavLink
              to="/pricing"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-dream-purple/20 to-dream-blue/20 border border-dream-purple/30 text-dream-purple text-sm font-medium hover:from-dream-purple/30 hover:to-dream-blue/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              升级订阅
            </NavLink>
          )}
        </div>

        {/* 用户信息区域 */}
        <div className="p-4 border-t border-night-700/50">
          {/* 用户头像和基本信息 */}
          <div className="flex items-center gap-3 mb-3">
            {/* 用户头像，取昵称或邮箱首字母作为占位符 */}
            <div className="w-8 h-8 rounded-lg bg-night-700 flex items-center justify-center text-sm font-medium text-dream-purple">
              {user?.nickname?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.nickname || '用户'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          {/* 退出登录按钮 */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </button>
        </div>
      </motion.aside>
    </>
  );
}
