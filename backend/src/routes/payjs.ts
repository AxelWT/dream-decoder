import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { createOrder, getOrderStatus, handleNotify } from '../services/payjs.js';

const router = Router();

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

// GET /api/plans - public
router.get('/plans', async (_req: Request, res: Response) => {
  res.json(PLANS);
});

// POST /api/payjs/create-order
router.post('/payjs/create-order', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    if (!plan || !['PRO', 'PREMIUM', 'LIFETIME'].includes(plan)) {
      return res.status(400).json({ error: '无效的订阅计划' });
    }
    const result = await createOrder(req.userId!, plan);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '创建支付订单失败' });
  }
});

// GET /api/payjs/order-status - 查询订单状态
router.get('/payjs/order-status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { order_id } = req.query;
    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json({ error: '缺少订单号' });
    }
    const result = await getOrderStatus(order_id, req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '查询订单状态失败' });
  }
});

// POST /api/payjs/notify - PayJS 异步回调（无需鉴权）
router.post('/payjs/notify', async (req: Request, res: Response) => {
  try {
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
