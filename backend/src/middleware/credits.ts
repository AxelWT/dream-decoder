import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../index.js';

const UNLIMITED_PLANS = ['PRO', 'PREMIUM', 'LIFETIME'];

export async function creditsMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { credits: true, plan: true },
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    if (UNLIMITED_PLANS.includes(user.plan)) {
      return next();
    }

    if (user.credits <= 0) {
      return res.status(403).json({
        error: 'AI 解构次数已用完，请升级订阅获取无限次使用',
        credits: 0,
        plan: user.plan,
      });
    }

    next();
  } catch {
    res.status(500).json({ error: '额度检查失败' });
  }
}
