/**
 * 额度检查中间件
 *
 * 职责：在用户调用 AI 解构等消耗额度的接口前，检查其剩余额度是否充足。
 * 对于无限额度套餐（PRO / PREMIUM / LIFETIME）用户直接放行；
 * 对于普通用户，额度不足时返回 403 状态码并提示升级订阅。
 *
 * 前置依赖：需在 authMiddleware 之后使用，依赖 req.userId 获取当前用户标识。
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../index.js';

/** 享有无限额度的套餐计划列表，这些套餐的用户不受额度数量限制 */
const UNLIMITED_PLANS = ['PRO', 'PREMIUM', 'LIFETIME'];

/**
 * 额度检查中间件函数
 *
 * 执行流程：
 * 1. 根据 req.userId 从数据库查询用户的额度和套餐信息
 * 2. 若用户不存在，返回 401
 * 3. 若用户属于无限额度套餐，直接调用 next() 放行
 * 4. 若用户额度不足（≤0），返回 403 并携带剩余额度与套餐信息，提示升级
 * 5. 额度充足时放行
 * 6. 查询异常时返回 500
 *
 * @param req  - 认证后的请求对象，需携带 userId 字段
 * @param res  - Express 响应对象，用于返回错误信息
 * @param next - Express next 函数，检查通过后调用以放行请求
 */
export async function creditsMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 根据用户 ID 查询额度与套餐信息，仅选取需要的字段以减少数据传输
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { credits: true, plan: true },
    });

    // 用户不存在（可能已被删除或 Token 指向无效用户）
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    // 无限额度套餐用户直接放行，无需检查额度数量
    if (UNLIMITED_PLANS.includes(user.plan)) {
      return next();
    }

    // 普通用户额度不足时，返回 403 并附带当前额度和套餐信息，方便前端引导升级
    if (user.credits <= 0) {
      return res.status(403).json({
        error: 'AI 解构次数已用完，请升级订阅获取无限次使用',
        credits: 0,
        plan: user.plan,
      });
    }

    // 额度充足，放行请求
    next();
  } catch {
    // 数据库查询等异常，返回 500 内部错误
    res.status(500).json({ error: '额度检查失败' });
  }
}
