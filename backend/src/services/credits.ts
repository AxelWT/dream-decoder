/**
 * 额度服务模块
 *
 * 负责用户额度（credits）的管理，包括：
 * - 消耗额度（每次 AI 对话扣减 1 额度）
 * - 赠送额度（充值、管理员操作等场景）
 * - 每日登录奖励（每天首次登录赠送 1 额度）
 *
 * 无限计划（PRO / PREMIUM / LIFETIME）用户不受额度限制
 */
import { prisma } from '../index.js';

/**
 * 无限额度计划列表
 * 这些计划的用户在消耗额度时不会真正扣减，返回 -1 表示无限制
 */
const UNLIMITED_PLANS = ['PRO', 'PREMIUM', 'LIFETIME'];

/**
 * 消耗 1 个额度
 *
 * 核心逻辑：
 * 1. 查找用户，不存在则抛出异常
 * 2. 若用户属于无限额度计划，直接返回 { remaining: -1 }（-1 表示无限制）
 * 3. 若额度不足（<=0），抛出 INSUFFICIENT_CREDITS 异常
 * 4. 原子性递减额度（使用 Prisma decrement 避免并发问题）
 *
 * @param userId - 用户 ID
 * @returns { remaining: number, plan: string } 剩余额度和计划类型
 * @throws 用户不存在 / INSUFFICIENT_CREDITS（额度不足）
 */
export async function consumeCredit(userId: string): Promise<{ remaining: number; plan: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('用户不存在');

  // 无限额度计划用户无需扣减，remaining = -1 表示无限制
  if (UNLIMITED_PLANS.includes(user.plan)) {
    return { remaining: -1, plan: user.plan };
  }

  // 额度不足检查
  if (user.credits <= 0) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  // 原子性递减 1 个额度（并发安全）
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } },
  });

  return { remaining: updated.credits, plan: updated.plan };
}

/**
 * 赠送额度
 *
 * 用于充值、管理员操作、补偿等场景，原子性递增用户额度
 *
 * @param userId - 用户 ID
 * @param amount - 赠送额度数量（正整数）
 * @returns 更新后的额度总数
 */
export async function grantCredits(userId: string, amount: number): Promise<number> {
  // 原子性递增指定数量的额度（并发安全）
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
  return updated.credits;
}

/**
 * 检查并发放每日登录奖励
 *
 * 核心逻辑：
 * 1. 无限额度计划用户不发放每日奖励（无需额度）
 * 2. 判断今天是否已经领取过（比较年月日，不考虑时区差异的边界情况）
 * 3. 若今天已领取，返回 { bonus: false }，不重复发放
 * 4. 若今天未领取，原子性递增 1 额度，更新最后领取时间
 *
 * @param userId - 用户 ID
 * @returns { bonus: boolean, credits: number } bonus 表示是否成功发放奖励，credits 为当前额度
 */
export async function checkDailyBonus(userId: string): Promise<{ bonus: boolean; credits: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, plan: true, lastDailyBonus: true },
  });
  if (!user) throw new Error('用户不存在');

  // 无限额度计划用户无需每日奖励
  if (UNLIMITED_PLANS.includes(user.plan)) {
    return { bonus: false, credits: user.credits };
  }

  const now = new Date();
  const lastBonus = user.lastDailyBonus;

  // 判断是否同一天（精确到年月日，忽略时分秒）
  if (lastBonus) {
    const lastDate = new Date(lastBonus);
    const isSameDay =
      lastDate.getFullYear() === now.getFullYear() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getDate() === now.getDate();

    // 今天已经领取过，不重复发放
    if (isSameDay) {
      return { bonus: false, credits: user.credits };
    }
  }

  // 发放每日奖励：递增 1 额度，更新最后领取时间
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: { increment: 1 },
      lastDailyBonus: now,
    },
    select: { credits: true },
  });

  return { bonus: true, credits: updated.credits };
}
