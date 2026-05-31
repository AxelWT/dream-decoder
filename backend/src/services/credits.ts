import { prisma } from '../index.js';

const UNLIMITED_PLANS = ['PRO', 'PREMIUM', 'LIFETIME'];

export async function consumeCredit(userId: string): Promise<{ remaining: number; plan: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('用户不存在');

  if (UNLIMITED_PLANS.includes(user.plan)) {
    return { remaining: -1, plan: user.plan }; // -1 means unlimited
  }

  if (user.credits <= 0) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } },
  });

  return { remaining: updated.credits, plan: updated.plan };
}

export async function grantCredits(userId: string, amount: number): Promise<number> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
  return updated.credits;
}

export async function checkDailyBonus(userId: string): Promise<{ bonus: boolean; credits: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, plan: true, lastDailyBonus: true },
  });
  if (!user) throw new Error('用户不存在');

  if (UNLIMITED_PLANS.includes(user.plan)) {
    return { bonus: false, credits: user.credits };
  }

  const now = new Date();
  const lastBonus = user.lastDailyBonus;

  if (lastBonus) {
    const lastDate = new Date(lastBonus);
    const isSameDay =
      lastDate.getFullYear() === now.getFullYear() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getDate() === now.getDate();

    if (isSameDay) {
      return { bonus: false, credits: user.credits };
    }
  }

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
