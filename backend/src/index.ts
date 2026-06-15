/**
 * 梦境解构师 (Dream Decoder) - 后端服务入口文件
 *
 * 职责：
 * 1. 初始化 Express 应用及全局中间件（CORS、JSON 解析）
 * 2. 注册各业务模块的路由（认证、梦境、AI 分析、档案、洞察、卡片、支付）
 * 3. 生产环境下托管前端静态资源，支持 SPA 路由回退
 * 4. 全局错误处理与优雅关闭
 */

// 在所有其他 import 之前加载 .env 环境变量，确保后续模块能读取到配置
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import dreamRoutes from './routes/dreams.js';
import analysisRoutes from './routes/analysis.js';
import profileRoutes from './routes/profile.js';
import insightsRoutes from './routes/insights.js';
import cardsRoutes from './routes/cards.js';
import payjsRoutes from './routes/payjs.js';
import { errorHandler } from './middleware/errorHandler.js';

// 获取当前文件所在目录的绝对路径（ES Module 中没有 __dirname）
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 创建全局 PrismaClient 实例，供其他模块复用
export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// 允许跨域请求
app.use(cors());
// 解析 JSON 请求体，限制最大 10MB 防止超大请求耗尽内存
app.use(express.json({ limit: '10mb' }));

// ---- 注册各业务模块路由 ----

// 认证相关：发送验证码、验证码登录、密码登录、注册、重置密码、获取当前用户
app.use('/api/auth', authRoutes);
// 梦境记录 CRUD：创建、列表、详情、更新、删除
app.use('/api/dreams', dreamRoutes);
// AI 分析：流式对话、会话列表、会话详情、删除会话
app.use('/api/analysis', analysisRoutes);
// 用户档案：获取/更新个人背景、头像上传、统计数据
app.use('/api/profile', profileRoutes);
// 数据洞察：焦虑曲线、主题词云、统计概览、焦虑指数补填
app.use('/api/insights', insightsRoutes);
// 梦境视觉卡片：生成、列表、详情、删除
app.use('/api/cards', cardsRoutes);
// 支付相关：订阅计划列表、创建订单、查询订单状态、PayJS 异步回调
app.use('/api', payjsRoutes); // /api/plans, /api/payjs/*

// 健康检查端点，用于部署探针或负载均衡检测
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- 生产环境静态资源托管 ----

// 将前端构建产物（frontend/dist）作为静态资源托管
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA 回退：非 /api/ 开头的路由均返回 index.html，交由前端路由处理
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// 全局错误处理中间件，捕获所有未处理的异常
app.use(errorHandler);

// 启动 HTTP 服务器
app.listen(PORT, () => {
  console.log(`🌙 Dream Decoder backend running on http://localhost:${PORT}`);
});

// 优雅关闭：收到 SIGTERM 信号时断开数据库连接再退出
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
