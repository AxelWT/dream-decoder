/**
 * JWT 认证中间件
 *
 * 职责：拦截需要登录才能访问的路由，从请求头中提取 Bearer Token 并验证其合法性。
 * 验证通过后将用户 ID 注入到请求对象中，供后续中间件和路由处理器使用；
 * 验证失败则返回 401 状态码，阻止请求继续向下传递。
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

/**
 * 扩展的 Express 请求类型
 *
 * 在标准 Request 基础上追加 userId 字段，
 * 用于在认证通过后携带当前登录用户的 ID，
 * 后续中间件和路由可通过 req.userId 获取当前用户标识。
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * JWT 认证中间件函数
 *
 * 执行流程：
 * 1. 检查请求头中是否包含 Authorization 字段，且以 "Bearer " 开头
 * 2. 提取 Token 字符串并调用 verifyToken 进行验证
 * 3. 验证成功 → 将 payload 中的 userId 挂载到 req 上，调用 next() 放行
 * 4. 验证失败 → 返回 401 响应，拒绝请求
 *
 * @param req  - 扩展后的请求对象，携带可选的 userId 字段
 * @param res  - Express 响应对象，用于返回错误信息
 * @param next - Express next 函数，验证通过后调用以放行请求
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // 从请求头中获取 Authorization 字段
  const authHeader = req.headers.authorization;

  // 校验：请求头缺失或格式不正确（必须以 "Bearer " 开头）
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }

  // 从 "Bearer <token>" 中提取实际的 JWT 字符串
  const token = authHeader.split(' ')[1];
  // 调用工具函数验证 Token 签名和有效期，返回解码后的 payload 或 null
  const payload = verifyToken(token);

  // Token 验证失败（签名无效、已过期等）
  if (!payload) {
    return res.status(401).json({ error: 'Token 无效或已过期，请重新登录' });
  }

  // 验证通过：将用户 ID 挂载到请求对象上，供后续中间件和路由使用
  req.userId = payload.userId;
  // 放行，继续执行后续中间件 / 路由处理器
  next();
}
