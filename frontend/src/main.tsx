/**
 * 应用入口文件
 *
 * 职责：创建 React 根节点并挂载整个应用到 DOM。
 * - 使用 React 18 的 createRoot API 进行渲染
 * - 包裹 StrictMode 以在开发环境下检测潜在问题
 * - 引入全局样式 index.css
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 获取 HTML 中的根 DOM 节点（public/index.html 中的 <div id="root">）
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode 会在开发环境下对组件进行额外检查，不会影响生产构建
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
