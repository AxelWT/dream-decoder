/**
 * AI 分析路由模块
 *
 * 职责：处理 AI 梦境分析的流式对话、对话会话的查询与删除
 *
 * 路由端点列表（均需鉴权）：
 *  POST   /api/analysis/chat            - 与 AI 流式对话分析梦境（需消耗积分）
 *  GET    /api/analysis/sessions        - 获取对话会话列表
 *  GET    /api/analysis/sessions/:id    - 获取对话会话详情（含所有消息）
 *  DELETE /api/analysis/sessions/:id    - 删除对话会话
 */
import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { chatSchema } from '../utils/validator.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { creditsMiddleware } from '../middleware/credits.js';
import { consumeCredit } from '../services/credits.js';
import { streamChat } from '../services/deepseek.js';

const router = Router();

// 所有分析路由均需通过鉴权中间件
router.use(authMiddleware);

/**
 * POST /api/analysis/chat
 * 与 AI 进行流式对话，分析梦境
 *
 * 中间件：
 *   authMiddleware     - JWT 鉴权
 *   creditsMiddleware  - 积分检查（确保用户有足够积分）
 *
 * 请求参数：
 *   body.message   - 用户发送的消息内容
 *   body.sessionId - 对话会话 ID（可选，为空则创建新会话）
 *   body.dreamId   - 关联的梦境 ID（可选）
 *   body.school    - 心理学学派（可选）
 *
 * 响应格式（Server-Sent Events 流式响应）：
 *   data: { "content": "..." }   - AI 回复的文本片段
 *   data: { "credits": N, "plan": "..." } - 剩余积分和套餐信息
 *   data: [DONE]                  - 流式传输结束标记
 */
router.post('/chat', creditsMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 校验聊天参数
    const data = chatSchema.parse(req.body);

    // 在流式响应之前先扣除积分
    const { remaining, plan } = await consumeCredit(req.userId!);

    // 设置 SSE（Server-Sent Events）响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // 禁用 Nginx 缓冲，确保流式数据即时推送
    res.setHeader('X-Accel-Buffering', 'no');

    // 调用 DeepSeek 服务进行流式对话
    const generator = streamChat({
      userId: req.userId!,
      message: data.message,
      sessionId: data.sessionId,
      dreamId: data.dreamId,
      school: data.school,
    });

    // 逐块读取 AI 生成的内容并推送给客户端
    for await (const chunk of generator) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    // 在结束信号前发送剩余积分信息
    res.write(`data: ${JSON.stringify({ credits: remaining, plan })}\n\n`);
    // 发送流式结束标记
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    const message = err.message || 'AI 分析失败';
    // 如果响应头尚未发送，则以 JSON 格式返回错误
    if (!res.headersSent) {
      res.status(400).json({ error: message });
    } else {
      // 如果已经开始流式传输，则通过 SSE 事件发送错误信息
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

/**
 * GET /api/analysis/sessions
 * 获取当前用户的对话会话列表
 *
 * 响应格式：
 *   Session[] - 会话列表，按更新时间倒序排列
 *   每个会话包含：最新1条消息、关联梦境的 id 和 title
 */
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.userId! },
      // 按更新时间倒序，最近活跃的会话在前
      orderBy: { updatedAt: 'desc' },
      include: {
        // 仅包含每个会话的最新1条消息（用于会话列表预览）
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        // 关联梦境信息（仅取 id 和 title）
        dream: { select: { id: true, title: true } },
      },
    });

    res.json(sessions);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取对话列表失败' });
  }
});

/**
 * GET /api/analysis/sessions/:id
 * 获取指定对话会话的详情（含所有消息）
 *
 * 路径参数：
 *   params.id - 会话 ID
 *
 * 响应格式：
 *   成功: { ...session, messages: Message[], dream: Dream } - 完整会话详情
 *   失败(404): { error: '对话不存在' }
 */
router.get('/sessions/:id', async (req: AuthRequest, res: Response) => {
  try {
    // 查询会话详情，确保只能查看自己的会话
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        // 消息按创建时间正序排列（对话顺序）
        messages: { orderBy: { createdAt: 'asc' } },
        // 包含完整的梦境信息
        dream: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: '对话不存在' });
    }

    res.json(session);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取对话详情失败' });
  }
});

/**
 * DELETE /api/analysis/sessions/:id
 * 删除指定对话会话
 *
 * 路径参数：
 *   params.id - 会话 ID
 *
 * 响应格式：
 *   成功: { success: true }
 *   失败(404): { error: '对话不存在' }
 */
router.delete('/sessions/:id', async (req: AuthRequest, res: Response) => {
  try {
    // 先检查会话是否存在且属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!session) {
      return res.status(404).json({ error: '对话不存在' });
    }

    // 执行删除操作
    await prisma.chatSession.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '删除对话失败' });
  }
});

export default router;
