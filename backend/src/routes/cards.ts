import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

const CARD_STYLES = ['mystic', 'watercolor', 'minimal', 'surreal'] as const;

// POST /api/cards/generate
// Generate a dream card from a dream
router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const { dreamId, style } = req.body;

    if (!dreamId) {
      return res.status(400).json({ error: '请提供梦境ID' });
    }

    const cardStyle = CARD_STYLES.includes(style) ? style : 'mystic';

    const dream = await prisma.dream.findFirst({
      where: { id: dreamId, userId: req.userId! },
      include: {
        sessions: {
          include: { messages: { orderBy: { createdAt: 'desc' }, take: 5 } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!dream) {
      return res.status(404).json({ error: '梦境不存在' });
    }

    // Extract symbols from dream content and AI summary
    const symbols = extractSymbols(dream.content, dream.scenes);
    const theme = dream.aiSummary || dream.title || '潜意识的低语';

    // Find a meaningful quote from AI conversation
    let quote = '';
    if (dream.sessions.length > 0 && dream.sessions[0].messages.length > 0) {
      const aiMessages = dream.sessions[0].messages.filter((m) => m.role === 'assistant');
      if (aiMessages.length > 0) {
        // Extract a meaningful sentence from the last AI message
        const lastMsg = aiMessages[0].content;
        const sentences = lastMsg.split(/[。！？.!?]/).filter((s) => s.trim().length > 10);
        if (sentences.length > 0) {
          quote = sentences[Math.min(2, sentences.length - 1)].trim();
        }
      }
    }
    if (!quote) {
      quote = '你的潜意识正在诉说着一些重要的事情。';
    }

    const card = await prisma.dreamCard.create({
      data: {
        userId: req.userId!,
        dreamId,
        style: cardStyle,
        title: dream.title || theme.slice(0, 50),
        symbols,
        theme,
        quote,
        school: dream.sessions[0]?.school || 'integrated',
        emotions: dream.emotions,
      },
      include: {
        dream: { select: { id: true, title: true, recordedAt: true } },
      },
    });

    res.json(card);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '生成卡片失败' });
  }
});

// GET /api/cards
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      prisma.dreamCard.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          dream: { select: { id: true, title: true, recordedAt: true } },
        },
      }),
      prisma.dreamCard.count({ where: { userId: req.userId! } }),
    ]);

    res.json({ cards, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取卡片列表失败' });
  }
});

// GET /api/cards/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const card = await prisma.dreamCard.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        dream: { select: { id: true, title: true, content: true, recordedAt: true } },
      },
    });

    if (!card) {
      return res.status(404).json({ error: '卡片不存在' });
    }

    res.json(card);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取卡片详情失败' });
  }
});

// DELETE /api/cards/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const card = await prisma.dreamCard.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!card) {
      return res.status(404).json({ error: '卡片不存在' });
    }

    await prisma.dreamCard.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '删除卡片失败' });
  }
});

function extractSymbols(content: string, scenes: string[]): string[] {
  const symbols: Set<string> = new Set(scenes);

  // Common dream symbols to detect
  const symbolPatterns: [RegExp, string][] = [
    [/水|河|海|湖|雨|洪水|游泳/, '水'],
    [/飞|飞翔|飘|翅膀/, '飞行'],
    [/坠落|掉|跌/, '坠落'],
    [/追逐|追|跑|逃/, '追逐'],
    [/迷路|迷|找不到/, '迷路'],
    [/黑暗|黑|暗|夜晚/, '黑暗'],
    [/森林|树|林/, '森林'],
    [/山|高处|悬崖/, '高处'],
    [/考试|试卷|迟到/, '考试'],
    [/死|葬|墓/, '死亡'],
    [/故人|已故|去世/, '故人'],
    [/裸|赤裸/, '裸体'],
    [/火|燃烧|火焰/, '火'],
    [/动物|狗|猫|蛇|狼/, '动物'],
    [/车|驾驶|车祸/, '驾驶'],
    [/家|房子|房间/, '家'],
  ];

  for (const [pattern, symbol] of symbolPatterns) {
    if (pattern.test(content)) {
      symbols.add(symbol);
    }
  }

  return Array.from(symbols).slice(0, 8);
}

export default router;
