import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { profileSchema } from '../utils/validator.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/profile
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile: user.profile,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取档案失败' });
  }
});

// PUT /api/profile/avatar
router.put('/avatar', async (req: AuthRequest, res: Response) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== 'string') {
      return res.status(400).json({ error: '请提供头像数据' });
    }

    // Validate base64 image (max ~2MB after encoding)
    if (avatar.length > 2_800_000) {
      return res.status(400).json({ error: '头像文件过大，请压缩后重试' });
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { avatar },
      select: { id: true, avatar: true },
    });

    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '上传头像失败' });
  }
});

// PUT /api/profile
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = profileSchema.parse(req.body);

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId! },
      update: data,
      create: {
        userId: req.userId!,
        ...data,
        concerns: data.concerns || [],
        lifeChanges: data.lifeChanges || [],
      },
    });

    res.json(profile);
  } catch (err: any) {
    const message = err.message || '更新档案失败';
    res.status(400).json({ error: message });
  }
});

// GET /api/profile/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalDreams, monthlyDreams, emotions] = await Promise.all([
      prisma.dream.count({ where: { userId } }),
      prisma.dream.count({
        where: { userId, recordedAt: { gte: startOfMonth } },
      }),
      prisma.dream.findMany({
        where: { userId },
        select: { emotions: true },
      }),
    ]);

    // Count emotion frequency
    const emotionCount: Record<string, number> = {};
    for (const dream of emotions) {
      for (const emotion of dream.emotions) {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      }
    }

    const topEmotions = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    res.json({
      totalDreams,
      monthlyDreams,
      topEmotions,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取统计数据失败' });
  }
});

export default router;
