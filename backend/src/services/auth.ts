import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { signToken } from '../utils/jwt.js';
import { checkDailyBonus } from './credits.js';

// In-memory verification code store (use Redis in production)
const codeStore = new Map<string, { code: string; expiresAt: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(email: string) {
  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  codeStore.set(email, { code, expiresAt });

  // In development, log the code instead of sending email
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 验证码 [${email}]: ${code}`);
    return { success: true, message: `验证码已发送（开发模式，查看控制台）` };
  }

  // Send via email in production
  const { sendEmail } = await import('./email.js');
  await sendEmail({
    to: email,
    subject: '梦境解构师 - 验证码',
    html: `<p>您的验证码是：<strong>${code}</strong>，5分钟内有效。</p>`,
  });

  return { success: true, message: '验证码已发送到您的邮箱' };
}

export async function verifyCode(email: string, code: string) {
  const stored = codeStore.get(email);

  if (!stored) {
    throw new Error('请先获取验证码');
  }

  if (Date.now() > stored.expiresAt) {
    codeStore.delete(email);
    throw new Error('验证码已过期，请重新获取');
  }

  if (stored.code !== code) {
    throw new Error('验证码错误');
  }

  codeStore.delete(email);

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        nickname: email.split('@')[0],
      },
    });
  }

  const token = signToken(user.id);

  // Check daily bonus
  const bonus = await checkDailyBonus(user.id);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      credits: bonus.credits,
      plan: user.plan,
    },
  };
}

export async function loginWithPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new Error('邮箱或密码错误');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error('邮箱或密码错误');
  }

  const token = signToken(user.id);

  // Check daily bonus
  const bonus = await checkDailyBonus(user.id);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      credits: bonus.credits,
      plan: user.plan,
    },
  };
}

export async function register(email: string, password: string, nickname?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error('该邮箱已注册');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: nickname || email.split('@')[0],
    },
  });

  const token = signToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      credits: user.credits,
      plan: user.plan,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
    credits: user.credits,
    plan: user.plan,
    createdAt: user.createdAt,
    profile: user.profile,
  };
}
