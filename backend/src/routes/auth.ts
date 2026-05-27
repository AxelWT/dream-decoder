import { Router, Request, Response } from 'express';
import { emailSchema, loginPasswordSchema, registerSchema } from '../utils/validator.js';
import {
  sendVerificationCode,
  verifyCode,
  loginWithPassword,
  register,
  getCurrentUser,
} from '../services/auth.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/send-code
router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const email = emailSchema.parse(req.body.email);
    const result = await sendVerificationCode(email);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '发送验证码失败';
    res.status(400).json({ error: message });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    emailSchema.parse(email);
    const result = await verifyCode(email, code);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '验证码验证失败';
    res.status(400).json({ error: message });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await register(data.email, data.password, data.nickname);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '注册失败';
    res.status(400).json({ error: message });
  }
});

// POST /api/auth/login-password
router.post('/login-password', async (req: Request, res: Response) => {
  try {
    const data = loginPasswordSchema.parse(req.body);
    const result = await loginWithPassword(data.email, data.password);
    res.json(result);
  } catch (err: any) {
    const message = err.message || '登录失败';
    res.status(400).json({ error: message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getCurrentUser(req.userId!);
    res.json(user);
  } catch (err: any) {
    const message = err.message || '获取用户信息失败';
    res.status(400).json({ error: message });
  }
});

export default router;
