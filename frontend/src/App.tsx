/**
 * 应用根组件
 *
 * 职责：配置全局路由规则，定义所有页面的 URL 映射关系。
 * - 外层路由（/login、/pricing、/payment-success）不使用 MainLayout 布局
 * - 内层路由（嵌套在 MainLayout 中）共享侧边栏和导航栏
 * - 兜底路由处理 404 和历史 URL 重定向
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Record } from './pages/Record';
import { Analyze } from './pages/Analyze';
import { Timeline } from './pages/Timeline';
import { Insights } from './pages/Insights';
import { Gallery } from './pages/Gallery';
import { Profile } from './pages/Profile';
import { Pricing } from './pages/Pricing';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { NotFound } from './pages/NotFound';
import { DreamDetail } from './components/Dream/DreamDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页 - 无需 MainLayout，独立展示 */}
        <Route path="/login" element={<Login />} />
        {/* 定价页 - 公开访问，无需登录，独立展示 */}
        <Route path="/pricing" element={<Pricing />} />
        {/* 支付成功页 - 支付回调页，独立展示 */}
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* 以下路由均嵌套在 MainLayout 中，共享侧边栏和导航栏 */}
        <Route element={<MainLayout />}>
          {/* 首页 - 登录后默认页 */}
          <Route path="/" element={<Home />} />
          {/* 记录梦境页 - 用户录入梦境内容 */}
          <Route path="/record" element={<Record />} />
          {/* AI 分析页 - 新建分析（无 sessionId）或查看已有分析（带 sessionId） */}
          <Route path="/analyze" element={<Analyze />} />
          {/* AI 分析页 - 指定会话的分析记录 */}
          <Route path="/analyze/:sessionId" element={<Analyze />} />
          {/* 梦境时间线页 - 按时间轴展示所有梦境 */}
          <Route path="/timeline" element={<Timeline />} />
          {/* 梦境洞察页 - 展示梦境统计分析与趋势 */}
          <Route path="/insights" element={<Insights />} />
          {/* 梦境画廊页 - 展示梦境相关的视觉内容 */}
          <Route path="/gallery" element={<Gallery />} />
          {/* 个人资料页 - 修改用户信息和偏好设置 */}
          <Route path="/profile" element={<Profile />} />
          {/* 梦境详情页 - 查看单个梦境的完整信息 */}
          <Route path="/dream/:id" element={<DreamDetail />} />
        </Route>

        {/* 历史兼容重定向：将旧路径 /dreams 重定向到 /timeline */}
        <Route path="/dreams" element={<Navigate to="/timeline" replace />} />
        {/* 404 兜底路由 - 匹配所有未定义的路径 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
