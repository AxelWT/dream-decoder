/**
 * 支付路由模块
 *
 * 职责：处理订阅计划展示、支付订单创建、订单状态查询和 PayJS 异步回调通知
 *
 * 路由端点列表：
 *  GET  /api/plans                  - 获取所有订阅计划（公开接口，无需鉴权）
 *  POST /api/payjs/create-order     - 创建支付订单（需鉴权）
 *  GET  /api/payjs/order-status     - 查询订单状态（需鉴权）
 *  POST /api/payjs/notify           - PayJS 异步回调通知（无需鉴权，由 PayJS 服务器调用）
 */
import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { createOrder, getOrderStatus, handleNotify } from '../services/payjs.js';

const router = Router();

/**
 * 订阅计划定义
 * 包含免费版、探索版、深度版和终身版四个等级
 */
const PLANS = [
  {
    id: 'FREE',
    name: '免费版',
    price: 0,
    currency: 'CNY',
    interval: '',
    features: ['每日登录赠送 1 次 AI 解构', '梦境记录与时间线', '基础数据洞察'],
  },
  {
    id: 'PRO',
    name: '探索版',
    price: 29,
    currency: 'CNY',
    interval: 'month',
    features: ['无限 AI 解构', '全部心理学学派', '梦境画廊生成', '深度数据洞察'],
  },
  {
    id: 'PREMIUM',
    name: '深度版',
    price: 79,
    currency: 'CNY',
    interval: 'month',
    features: ['探索版全部功能', '高级梦境分析模型', '个人梦境报告', '优先客服支持'],
  },
  {
    id: 'LIFETIME',
    name: '终身版',
    price: 499,
    currency: 'CNY',
    interval: 'one-time',
    features: ['深度版全部功能', '终身免费更新', '专属徽章'],
  },
];

/**
 * GET /api/plans
 * 获取所有可用的订阅计划列表
 *
 * 鉴权：无需鉴权（公开接口，供前端展示定价页面）
 *
 * 响应格式：
 *   Plan[] - 订阅计划数组，包含 id、name、price、currency、interval、features
 */
router.get('/plans', async (_req: Request, res: Response) => {
  res.json(PLANS);
});

/**
 * POST /api/payjs/create-order
 * 创建支付订单
 *
 * 鉴权：需登录
 *
 * 请求参数：
 *   body.plan - 订阅计划 ID（必填，可选值: PRO / PREMIUM / LIFETIME）
 *
 * 响应格式：
 *   成功: { ...result } - 订单信息（含支付链接、订单号等）
 *   失败(400): { error: string } - 无效的计划或创建失败
 */
router.post('/payjs/create-order', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    // 校验计划类型，FREE 不可购买
    if (!plan || !['PRO', 'PREMIUM', 'LIFETIME'].includes(plan)) {
      return res.status(400).json({ error: '无效的订阅计划' });
    }
    // 调用服务层创建支付订单
    const result = await createOrder(req.userId!, plan);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '创建支付订单失败' });
  }
});

/**
 * GET /api/payjs/order-status
 * 查询支付订单状态
 *
 * 鉴权：需登录
 *
 * 查询参数：
 *   query.order_id - 订单号（必填）
 *
 * 响应格式：
 *   成功: { ...result } - 订单状态信息
 *   失败(400): { error: string } - 缺少订单号或查询失败
 */
router.get('/payjs/order-status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { order_id } = req.query;
    // 校验订单号参数
    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json({ error: '缺少订单号' });
    }
    // 调用服务层查询订单状态
    const result = await getOrderStatus(order_id, req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '查询订单状态失败' });
  }
});

/**
 * POST /api/payjs/notify
 * PayJS 支付完成后的异步回调通知
 *
 * 鉴权：无需鉴权（由 PayJS 服务器主动调用）
 *
 * 请求参数：
 *   body - PayJS 回调数据（包含支付结果、订单号、签名等信息）
 *
 * 响应格式：
 *   成功: "SUCCESS" - 通知 PayJS 已成功处理
 *   失败: "FAIL" - 处理失败
 */
router.post('/payjs/notify', async (req: Request, res: Response) => {
  try {
    // 调用服务层处理回调数据（验签、更新订单状态、激活订阅等）
    const success = await handleNotify(req.body);
    if (success) {
      res.send('SUCCESS');
    } else {
      res.status(400).send('FAIL');
    }
  } catch (err: any) {
    console.error('PayJS 回调处理失败:', err.message);
    res.status(500).send('FAIL');
  }
});

export default router;
