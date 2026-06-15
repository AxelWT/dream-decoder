/**
 * 全局错误处理中间件
 *
 * 职责：作为 Express 错误处理链的最后一环，捕获所有未被路由或其它中间件处理的异常，
 * 统一记录错误日志并返回 500 响应，防止未处理的异常导致进程崩溃或暴露敏感堆栈信息。
 *
 * 注意：Express 错误处理中间件必须接收 4 个参数 (err, req, res, next)，
 * 框架通过参数个数来区分普通中间件与错误处理中间件。
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 全局错误处理中间件函数
 *
 * 当路由或其它中间件中抛出异常（或调用 next(err)）时，Express 会跳过
 * 所有普通中间件，将错误传递到此处统一处理。
 *
 * @param err   - 捕获到的错误对象
 * @param _req  - 请求对象（此处未使用，加下划线前缀标记）
 * @param res   - 响应对象，用于向客户端返回统一格式的错误信息
 * @param _next - next 函数（此处未使用，加下划线前缀标记）
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // 在服务端控制台打印完整错误信息，便于运维排查问题
  console.error('Unhandled error:', err);
  // 向客户端返回统一的 500 错误响应，不暴露内部错误细节
  res.status(500).json({ error: '服务器内部错误，请稍后重试' });
}
