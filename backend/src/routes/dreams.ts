import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { dreamSchema, updateDreamSchema } from '../utils/validator.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { scoreAnxiety } from '../services/deepseek.js';

const router = Router();

// All dream routes require auth
router.use(authMiddleware);

// POST /api/dreams
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = dreamSchema.parse(req.body);

    const dream = await prisma.dream.create({
      data: {
        userId: req.userId!,
        title: data.title,
        content: data.content,
        emotions: data.emotions,
        clarity: data.clarity,
        dreamType: data.dreamType,
        scenes: data.scenes,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
      },
    });

    // Auto-generate anxiety score in background
    scoreAnxiety(data.content, data.emotions).then((score) => {
      if (score !== null) {
        prisma.dream.update({
          where: { id: dream.id },
          data: { anxietyScore: score },
        }).catch((err) => console.error('Failed to save anxiety score:', err));
      }
    });

    res.json(dream);
  } catch (err: any) {
    const message = err.message || '创建梦境记录失败';
    res.status(400).json({ error: message });
  }
});

// GET /api/dreams
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where: { userId: req.userId! },
        orderBy: { recordedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dream.count({ where: { userId: req.userId! } }),
    ]);

    res.json({
      dreams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取梦境列表失败' });
  }
});

// GET /api/dreams/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const dream = await prisma.dream.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: { sessions: { orderBy: { createdAt: 'desc' } } },
    });

    if (!dream) {
      return res.status(404).json({ error: '梦境不存在' });
    }

    res.json(dream);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取梦境详情失败' });
  }
});

// PUT /api/dreams/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = updateDreamSchema.parse(req.body);

    const existing = await prisma.dream.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: '梦境不存在' });
    }

    const dream = await prisma.dream.update({
      where: { id: req.params.id },
      data,
    });

    res.json(dream);
  } catch (err: any) {
    const message = err.message || '更新梦境失败';
    res.status(400).json({ error: message });
  }
});

// DELETE /api/dreams/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const dream = await prisma.dream.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!dream) {
      return res.status(404).json({ error: '梦境不存在' });
    }

    await prisma.dream.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '删除梦境失败' });
  }
});

export default router;
