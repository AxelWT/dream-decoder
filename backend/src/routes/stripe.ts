import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  getPlans,
} from '../services/stripe.js';

const router = Router();

// GET /api/plans - public
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await getPlans();
    res.json(plans);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取计划列表失败' });
  }
});

// POST /api/stripe/create-checkout
router.post('/stripe/create-checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    if (!plan || !['PRO', 'PREMIUM', 'LIFETIME'].includes(plan)) {
      return res.status(400).json({ error: '无效的订阅计划' });
    }
    const result = await createCheckoutSession(req.userId!, plan);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '创建支付会话失败' });
  }
});

// POST /api/stripe/portal
router.post('/stripe/portal', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await createPortalSession(req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '创建客户门户失败' });
  }
});

// POST /api/stripe/webhook - raw body needed
router.post('/stripe/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Webhook 配置缺失' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    const event = stripe.webhooks.constructEvent(
      req.body, // raw body buffer
      sig,
      webhookSecret
    );

    await handleWebhook(event);
    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
});

export default router;
