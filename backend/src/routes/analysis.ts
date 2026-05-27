import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { chatSchema } from '../utils/validator.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { creditsMiddleware } from '../middleware/credits.js';
import { consumeCredit } from '../services/credits.js';
import { streamChat } from '../services/deepseek.js';

const router = Router();

// All analysis routes require auth
router.use(authMiddleware);

// POST /api/analysis/chat - Streaming AI chat
router.post('/chat', creditsMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = chatSchema.parse(req.body);

    // Consume credit before streaming
    const { remaining, plan } = await consumeCredit(req.userId!);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const generator = streamChat({
      userId: req.userId!,
      message: data.message,
      sessionId: data.sessionId,
      dreamId: data.dreamId,
      school: data.school,
    });

    for await (const chunk of generator) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    // Send remaining credits info before done signal
    res.write(`data: ${JSON.stringify({ credits: remaining, plan })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    const message = err.message || 'AI 分析失败';
    if (!res.headersSent) {
      res.status(400).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

// GET /api/analysis/sessions
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.userId! },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        dream: { select: { id: true, title: true } },
      },
    });

    res.json(sessions);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取对话列表失败' });
  }
});

// GET /api/analysis/sessions/:id
router.get('/sessions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
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

// DELETE /api/analysis/sessions/:id
router.delete('/sessions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!session) {
      return res.status(404).json({ error: '对话不存在' });
    }

    await prisma.chatSession.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '删除对话失败' });
  }
});

export default router;
