import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { signToken } from '../utils/jwt.js';
import { checkDailyBonus } from './credits.js';
import { sendEmail } from './email.js';

// In-memory verification code store (use Redis in production)
const codeStore = new Map<string, { code: string; expiresAt: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildEmailTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#3b82f6);display:inline-block;line-height:48px;text-align:center;font-size:24px;">🌙</div>
          <div style="color:#e2e8f0;font-size:20px;font-weight:700;margin-top:12px;letter-spacing:1px;">梦境解构师</div>
        </td></tr>
        <!-- Card -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e,#16162a);border-radius:16px;border:1px solid rgba(124,58,237,0.2);overflow:hidden;">
            <!-- Header -->
            <tr><td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:28px 32px;">
              <div style="color:#ffffff;font-size:18px;font-weight:600;">${title}</div>
            </td></tr>
            <!-- Body -->
            <tr><td style="padding:32px;">
              ${content}
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <div style="color:#64748b;font-size:12px;line-height:1.6;">
            此邮件由系统自动发送，请勿直接回复<br>
            © ${new Date().getFullYear()} 梦境解构师 · 探索潜意识的奥秘
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationCode(email: string) {
  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  codeStore.set(email, { code, expiresAt });

  // Log code to console unless ENABLE_EMAIL is set
  if (!process.env.ENABLE_EMAIL) {
    console.log(`📧 验证码 [${email}]: ${code}`);
    return { success: true, message: `验证码已发送（开发模式，查看控制台）` };
  }

  // Send via email (non-blocking)
  sendEmail({
    to: email,
    subject: '梦境解构师 - 验证码',
    html: buildEmailTemplate('邮箱验证码', `
      <div style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:24px;">
        您正在进行邮箱验证，验证码为：
      </div>
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:16px 32px;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#a78bfa;">${code}</span>
        </div>
      </div>
      <div style="color:#64748b;font-size:13px;text-align:center;margin-top:16px;">
        验证码 <span style="color:#f59e0b;font-weight:600;">5 分钟</span>内有效，请勿泄露给他人
      </div>
    `),
  }).catch((err) => console.error('邮件发送失败:', err));

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

export async function register(email: string, password: string, nickname: string | undefined, code: string) {
  // Verify email code first
  const stored = codeStore.get(email);
  if (!stored) throw new Error('请先获取验证码');
  if (Date.now() > stored.expiresAt) {
    codeStore.delete(email);
    throw new Error('验证码已过期，请重新获取');
  }
  if (stored.code !== code) throw new Error('验证码错误');
  codeStore.delete(email);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error('该邮箱已注册');
  }

  const passwordHash = await bcrypt.hash(password, 8);

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

export async function sendResetCode(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal whether the email exists
    return { success: true, message: '如果该邮箱已注册，重置码将发送到您的邮箱' };
  }

  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  codeStore.set(`reset:${email}`, { code, expiresAt });

  if (!process.env.ENABLE_EMAIL) {
    console.log(`🔑 密码重置码 [${email}]: ${code}`);
    return { success: true, message: `重置码已发送（开发模式，查看控制台）` };
  }

  sendEmail({
    to: email,
    subject: '梦境解构师 - 密码重置',
    html: buildEmailTemplate('密码重置', `
      <div style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:24px;">
        您正在重置账户密码，重置码为：
      </div>
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:16px 32px;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#a78bfa;">${code}</span>
        </div>
      </div>
      <div style="color:#64748b;font-size:13px;text-align:center;margin-top:16px;">
        重置码 <span style="color:#f59e0b;font-weight:600;">10 分钟</span>内有效
      </div>
      <div style="color:#ef4444;font-size:12px;text-align:center;margin-top:12px;background:rgba(239,68,68,0.08);border-radius:8px;padding:8px;">
        如果这不是您的操作，请忽略此邮件，您的密码不会被更改
      </div>
    `),
  }).catch((err) => console.error('邮件发送失败:', err));

  return { success: true, message: '如果该邮箱已注册，重置码将发送到您的邮箱' };
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const stored = codeStore.get(`reset:${email}`);

  if (!stored) {
    throw new Error('请先获取重置码');
  }

  if (Date.now() > stored.expiresAt) {
    codeStore.delete(`reset:${email}`);
    throw new Error('重置码已过期，请重新获取');
  }

  if (stored.code !== code) {
    throw new Error('重置码错误');
  }

  codeStore.delete(`reset:${email}`);

  const passwordHash = await bcrypt.hash(newPassword, 8);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  return { success: true, message: '密码重置成功，请使用新密码登录' };
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
