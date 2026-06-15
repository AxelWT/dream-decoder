/**
 * 认证路由模块
 *
 * 职责：处理用户注册、登录、验证码发送/验证、密码重置等认证相关请求
 *
 * 路由端点列表：
 *  POST   /api/auth/send-code       - 发送邮箱验证码
 *  POST   /api/auth/verify           - 验证邮箱验证码
 *  POST   /api/auth/register         - 用户注册
 *  POST   /api/auth/login-password   - 密码登录
 *  POST   /api/auth/forgot-password  - 发送密码重置验证码
 *  POST   /api/auth/reset-password   - 重置密码
 *  GET    /api/auth/me               - 获取当前登录用户信息（需鉴权）
 */
import { Router, Request, Response } from 'express';
import { emailSchema, loginPasswordSchema, registerSchema } from '../utils/validator.js';
import {
  sendVerificationCode,
  verifyCode,
  loginWithPassword,
  register,
  getCurrentUser,
  sendResetCode,
  resetPassword,
} from '../services/auth.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/send-code
 * 发送邮箱验证码
 *
 * 请求参数：
 *   body.email - 用户邮箱地址（需通过 emailSchema 校验）
 *
 * 响应格式：
 *   成功: { ...result } - 发送结果
 *   失败: { error: string } - 错误信息
 */
router.post('/send-code', async (req: Request, res: Response) => {
  try {
    // 校验邮箱格式
    const email = emailSchema.parse(req.body.email);
    // 调用服务层发送验证码
    const result = await sendVerificationCode(email);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '发送验证码失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/verify
 * 验证邮箱验证码是否正确
 *
 * 请求参数：
 *   body.email - 用户邮箱地址
 *   body.code  - 用户输入的验证码
 *
 * 响应格式：
 *   成功: { ...result } - 验证结果
 *   失败: { error: string } - 错误信息
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    // 校验邮箱格式
    emailSchema.parse(email);
    // 验证验证码是否匹配
    const result = await verifyCode(email, code);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '验证码验证失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/register
 * 用户注册
 *
 * 请求参数：
 *   body.email    - 邮箱地址
 *   body.password - 密码
 *   body.nickname - 昵称
 *   body.code     - 邮箱验证码
 *
 * 响应格式：
 *   成功: { ...result } - 注册结果（含 token 等）
 *   失败: { error: string } - 错误信息
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // 使用 registerSchema 统一校验注册参数
    const data = registerSchema.parse(req.body);
    // 调用服务层完成注册
    const result = await register(data.email, data.password, data.nickname, data.code);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '注册失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/login-password
 * 使用邮箱+密码登录
 *
 * 请求参数：
 *   body.email    - 邮箱地址
 *   body.password - 密码
 *
 * 响应格式：
 *   成功: { ...result } - 登录结果（含 token 等）
 *   失败: { error: string } - 错误信息
 */
router.post('/login-password', async (req: Request, res: Response) => {
  try {
    // 校验登录参数
    const data = loginPasswordSchema.parse(req.body);
    // 调用服务层验证密码并登录
    const result = await loginWithPassword(data.email, data.password);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '登录失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/forgot-password
 * 忘记密码 - 发送密码重置验证码到用户邮箱
 *
 * 请求参数：
 *   body.email - 用户邮箱地址
 *
 * 响应格式：
 *   成功: { ...result } - 发送结果
 *   失败: { error: string } - 错误信息
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    // 校验邮箱格式
    emailSchema.parse(email);
    // 发送重置验证码
    const result = await sendResetCode(email);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '发送重置码失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/reset-password
 * 重置密码 - 使用验证码设置新密码
 *
 * 请求参数：
 *   body.email       - 用户邮箱地址
 *   body.code        - 重置验证码
 *   body.newPassword - 新密码（至少6位）
 *
 * 响应格式：
 *   成功: { ...result } - 重置结果
 *   失败: { error: string } - 错误信息
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    // 校验邮箱格式
    emailSchema.parse(email);
    // 校验重置码是否为非空字符串
    if (!code || typeof code !== 'string') {
      throw new Error('请输入重置码');
    }
    // 校验新密码长度
    if (!newPassword || newPassword.length < 6) {
      throw new Error('新密码至少6位');
    }
    // 调用服务层重置密码
    const result = await resetPassword(email, code, newPassword);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '重置密码失败';
    res.status(400).json({ error: message });
  }
});

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 *
 * 请求头：
 *   Authorization: Bearer <token> - JWT 令牌
 *
 * 响应格式：
 *   成功: { ...user } - 用户信息
 *   失败: { error: string } - 错误信息
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 通过鉴权中间件注入的 userId 获取用户信息
    const user = await getCurrentUser(req.userId!);
    res.json(user);
  } catch (err: any) {
    const message = err.message || '获取用户信息失败';
    res.status(400).json({ error: message });
  }
});

export default router;
