/**
 * Header - 顶部导航栏组件
 * 
 * 职责：
 * - 显示当前页面标题
 * - 提供移动端汉堡菜单按钮，用于打开侧边栏
 * - 显示 AI 服务状态指示器
 * - 采用粘性定位（sticky），滚动时始终固定在顶部
 */

/** Header 组件的 Props 接口定义 */
interface HeaderProps {
  /** 汉堡菜单按钮点击回调，用于在移动端打开侧边栏 */
  onMenuClick: () => void;
  /** 当前页面标题，可选，不传则不显示 */
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    // 顶部栏容器，粘性定位 + 毛玻璃背景效果
    <header className="sticky top-0 z-30 bg-night-950/80 backdrop-blur-xl border-b border-night-700/50">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* 左侧区域：菜单按钮 + 页面标题 */}
        <div className="flex items-center gap-3">
          {/* 汉堡菜单按钮，仅在小屏幕（移动端）显示 */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-night-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* 页面标题，仅在 title 有值时渲染 */}
          {title && (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
        </div>

        {/* 右侧区域：AI 服务状态指示器 */}
        <div className="flex items-center gap-2">
          {/* 绿色脉冲圆点，表示 AI 服务在线 */}
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">DeepSeek AI 就绪</span>
        </div>
      </div>
    </header>
  );
}
