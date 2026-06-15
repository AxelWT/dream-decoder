/**
 * 认证服务模块
 *
 * 负责用户身份验证相关的所有核心逻辑，包括：
 * - 邮箱验证码的生成、发送与校验
 * - 验证码登录（自动注册）
 * - 密码登录
 * - 邮箱+密码注册
 * - 密码重置（发送重置码 + 验证重置码）
 * - 获取当前用户信息
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { signToken } from '../utils/jwt.js';
import { checkDailyBonus } from './credits.js';
import { sendEmail } from './email.js';

/**
 * 内存中的验证码存储
 * key: 邮箱地址（重置码使用 "reset:邮箱" 格式）
 * value: { code: 验证码字符串, expiresAt: 过期时间戳 }
 *
 * 注意：生产环境应替换为 Redis，当前实现重启后验证码会丢失
 */
const codeStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * 生成 6 位数字验证码
 * 范围: 100000 ~ 999999
 * @returns 6 位数字字符串
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 构建邮件 HTML 模板
 * 采用深色主题设计，与「梦境解构师」前端风格一致
 *
 * @param title - 邮件标题（显示在卡片头部紫色渐变区域）
 * @param content - 邮件正文 HTML 片段（嵌入卡片主体区域）
 * @returns 完整的 HTML 邮件内容
 */
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

/**
 * 发送邮箱验证码
 *
 * 核心流程：
 * 1. 生成 6 位随机验证码，有效期 5 分钟
 * 2. 将验证码存入内存存储
 * 3. 若未启用邮件服务（开发环境），直接在控制台打印验证码
 * 4. 若启用邮件服务，异步发送邮件（不阻塞主流程）
 *
 * @param email - 目标邮箱地址
 * @returns { success: boolean, message: string } 发送结果
 */
export async function sendVerificationCode(email: string) {
  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 验证码有效期 5 分钟

  codeStore.set(email, { code, expiresAt });

  // 开发模式：未设置 ENABLE_EMAIL 时，仅在控制台输出验证码
  if (!process.env.ENABLE_EMAIL) {
    console.log(`📧 验证码 [${email}]: ${code}`);
    return { success: true, message: `验证码已发送（开发模式，查看控制台）` };
  }

  // 生产模式：发送邮件（await 确保发送失败时能正确抛出错误）
  await sendEmail({
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
  });

  return { success: true, message: '验证码已发送到您的邮箱' };
}

/**
 * 验证码校验 & 自动注册登录
 *
 * 核心流程：
 * 1. 从内存存储中取出验证码记录
 * 2. 校验验证码是否过期、是否匹配
 * 3. 验证通过后删除验证码（一次性使用）
 * 4. 查找用户：若不存在则自动创建（验证码即登录/注册）
 * 5. 签发 JWT Token
 * 6. 检查并发放每日登录奖励
 *
 * @param email - 用户邮箱
 * @param code - 用户输入的验证码
 * @returns { token, user } 包含 JWT Token 和用户信息
 * @throws 验证码不存在 / 已过期 / 错误
 */
export async function verifyCode(email: string, code: string) {
  const stored = codeStore.get(email);

  // 验证码不存在：用户未发送验证码或已被清除
  if (!stored) {
    throw new Error('请先获取验证码');
  }

  // 验证码已过期：删除过期记录，防止内存泄漏
  if (Date.now() > stored.expiresAt) {
    codeStore.delete(email);
    throw new Error('验证码已过期，请重新获取');
  }

  // 验证码不匹配
  if (stored.code !== code) {
    throw new Error('验证码错误');
  }

  // 验证通过，删除验证码（确保一次性使用）
  codeStore.delete(email);

  // 查找用户，不存在则自动创建（验证码登录即注册模式）
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        nickname: email.split('@')[0], // 默认昵称取邮箱 @ 前缀
      },
    });
  }

  // 签发 JWT Token
  const token = signToken(user.id);

  // 检查并发放每日登录奖励额度
  const bonus = await checkDailyBonus(user.id);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      credits: bonus.credits, // 返回含每日奖励后的最新额度
      plan: user.plan,
    },
  };
}

/**
 * 密码登录
 *
 * 核心流程：
 * 1. 根据邮箱查找用户
 * 2. 使用 bcrypt 比对密码哈希
 * 3. 签发 JWT Token
 * 4. 检查并发放每日登录奖励
 *
 * @param email - 用户邮箱
 * @param password - 用户密码（明文）
 * @returns { token, user } 包含 JWT Token 和用户信息
 * @throws 邮箱或密码错误（统一提示，防止枚举攻击）
 */
export async function loginWithPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // 用户不存在或未设置密码时，统一返回"邮箱或密码错误"，防止邮箱枚举攻击
  if (!user || !user.passwordHash) {
    throw new Error('邮箱或密码错误');
  }

  // bcrypt 安全比对密码哈希
  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error('邮箱或密码错误');
  }

  const token = signToken(user.id);

  // 检查并发放每日登录奖励额度
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

/**
 * 邮箱+密码注册
 *
 * 核心流程：
 * 1. 验证邮箱验证码（必须先获取并验证通过）
 * 2. 检查邮箱是否已被注册
 * 3. 使用 bcrypt 哈希密码（salt rounds = 8）
 * 4. 创建用户记录
 * 5. 签发 JWT Token
 *
 * @param email - 用户邮箱
 * @param password - 用户密码（明文，将被哈希存储）
 * @param nickname - 用户昵称（可选，默认取邮箱 @ 前缀）
 * @param code - 邮箱验证码
 * @returns { token, user } 包含 JWT Token 和用户信息
 * @throws 验证码错误 / 邮箱已注册
 */
export async function register(email: string, password: string, nickname: string | undefined, code: string) {
  // 先验证邮箱验证码
  const stored = codeStore.get(email);
  if (!stored) throw new Error('请先获取验证码');
  if (Date.now() > stored.expiresAt) {
    codeStore.delete(email);
    throw new Error('验证码已过期，请重新获取');
  }
  if (stored.code !== code) throw new Error('验证码错误');
  codeStore.delete(email); // 验证通过后删除，确保一次性使用

  // 检查邮箱是否已被注册
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error('该邮箱已注册');
  }

  // 使用 bcrypt 哈希密码，salt rounds = 8（兼顾安全性与性能）
  const passwordHash = await bcrypt.hash(password, 8);

  // 创建用户记录
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: nickname || email.split('@')[0], // 昵称未提供时使用邮箱前缀
    },
  });

  const token = signToken(user.id);

  // 注册时不触发每日奖励（新用户初始额度由数据库默认值决定）
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

/**
 * 发送密码重置验证码
 *
 * 核心流程：
 * 1. 查找用户（无论是否找到，均返回统一提示，防止邮箱枚举）
 * 2. 生成 6 位重置码，有效期 10 分钟
 * 3. 以 "reset:邮箱" 为 key 存储（与登录验证码隔离）
 * 4. 异步发送重置码邮件
 *
 * @param email - 用户邮箱
 * @returns { success: true, message: string } 统一返回成功提示
 */
export async function sendResetCode(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // 安全策略：不暴露邮箱是否已注册，防止邮箱枚举攻击
  if (!user) {
    return { success: true, message: '如果该邮箱已注册，重置码将发送到您的邮箱' };
  }

  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 重置码有效期 10 分钟（比验证码更长）

  // 使用 "reset:" 前缀与登录验证码隔离，避免冲突
  codeStore.set(`reset:${email}`, { code, expiresAt });

  // 开发模式：仅在控制台输出
  if (!process.env.ENABLE_EMAIL) {
    console.log(`🔑 密码重置码 [${email}]: ${code}`);
    return { success: true, message: `重置码已发送（开发模式，查看控制台）` };
  }

  // 生产模式：发送重置码邮件（await 确保发送失败时能正确抛出错误）
  await sendEmail({
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
  });

  return { success: true, message: '如果该邮箱已注册，重置码将发送到您的邮箱' };
}

/**
 * 重置密码
 *
 * 核心流程：
 * 1. 从内存存储中取出重置码（key 为 "reset:邮箱"）
 * 2. 校验重置码是否过期、是否匹配
 * 3. 验证通过后删除重置码
 * 4. 使用 bcrypt 哈希新密码
 * 5. 更新用户密码
 *
 * @param email - 用户邮箱
 * @param code - 重置验证码
 * @param newPassword - 新密码（明文，将被哈希存储）
 * @returns { success: true, message: string }
 * @throws 重置码不存在 / 已过期 / 错误
 */
export async function resetPassword(email: string, code: string, newPassword: string) {
  const stored = codeStore.get(`reset:${email}`);

  if (!stored) {
    throw new Error('请先获取重置码');
  }

  // 重置码已过期，删除过期记录
  if (Date.now() > stored.expiresAt) {
    codeStore.delete(`reset:${email}`);
    throw new Error('重置码已过期，请重新获取');
  }

  // 重置码不匹配
  if (stored.code !== code) {
    throw new Error('重置码错误');
  }

  // 验证通过，删除重置码
  codeStore.delete(`reset:${email}`);

  // 哈希新密码
  const passwordHash = await bcrypt.hash(newPassword, 8);

  // 更新用户密码
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  return { success: true, message: '密码重置成功，请使用新密码登录' };
}

/**
 * 获取当前用户信息
 *
 * @param userId - 用户 ID（从 JWT Token 中解析获得）
 * @returns 用户详细信息，包含关联的 profile 数据
 * @throws 用户不存在
 */
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }, // 关联查询用户档案
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
