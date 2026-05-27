import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/insights/anxiety-curve
// Query: days (7|30|90, default 30)
router.get('/anxiety-curve', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const dreams = await prisma.dream.findMany({
      where: {
        userId,
        recordedAt: { gte: since },
      },
      select: {
        id: true,
        title: true,
        recordedAt: true,
        anxietyScore: true,
        emotions: true,
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Build daily data points
    const dataPoints = dreams
      .filter((d) => d.anxietyScore !== null)
      .map((d) => ({
        date: d.recordedAt.toISOString().split('T')[0],
        score: d.anxietyScore,
        dreamId: d.id,
        title: d.title,
        emotions: d.emotions,
      }));

    res.json({ days, dataPoints });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取焦虑曲线数据失败' });
  }
});

// GET /api/insights/theme-cloud
// Query: days (7|30|90, default 30)
router.get('/theme-cloud', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const dreams = await prisma.dream.findMany({
      where: {
        userId,
        recordedAt: { gte: since },
      },
      select: {
        emotions: true,
        scenes: true,
        dreamType: true,
      },
    });

    // Count frequencies
    const emotionCount: Record<string, number> = {};
    const sceneCount: Record<string, number> = {};
    const typeCount: Record<string, number> = {};

    for (const dream of dreams) {
      for (const e of dream.emotions) {
        emotionCount[e] = (emotionCount[e] || 0) + 1;
      }
      for (const s of dream.scenes) {
        sceneCount[s] = (sceneCount[s] || 0) + 1;
      }
      if (dream.dreamType) {
        typeCount[dream.dreamType] = (typeCount[dream.dreamType] || 0) + 1;
      }
    }

    const emotions = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const scenes = Object.entries(sceneCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const types = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    res.json({ emotions, scenes, types, totalDreams: dreams.length });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取主题数据失败' });
  }
});

// GET /api/insights/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalDreams, monthlyDreams, weeklyDreams, allDreams] = await Promise.all([
      prisma.dream.count({ where: { userId } }),
      prisma.dream.count({ where: { userId, recordedAt: { gte: startOfMonth } } }),
      prisma.dream.count({ where: { userId, recordedAt: { gte: startOfWeek } } }),
      prisma.dream.findMany({
        where: { userId },
        select: { emotions: true, scenes: true, dreamType: true, anxietyScore: true },
      }),
    ]);

    // Emotion frequency
    const emotionCount: Record<string, number> = {};
    for (const dream of allDreams) {
      for (const e of dream.emotions) {
        emotionCount[e] = (emotionCount[e] || 0) + 1;
      }
    }
    const topEmotions = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    // Scene frequency
    const sceneCount: Record<string, number> = {};
    for (const dream of allDreams) {
      for (const s of dream.scenes) {
        sceneCount[s] = (sceneCount[s] || 0) + 1;
      }
    }
    const topScenes = Object.entries(sceneCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([scene, count]) => ({ scene, count }));

    // Dream type distribution
    const typeCount: Record<string, number> = {};
    for (const dream of allDreams) {
      if (dream.dreamType) {
        typeCount[dream.dreamType] = (typeCount[dream.dreamType] || 0) + 1;
      }
    }
    const dreamTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    // Average anxiety score
    const scoresWithValues = allDreams.filter((d) => d.anxietyScore !== null);
    const avgAnxiety = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, d) => sum + d.anxietyScore!, 0) / scoresWithValues.length
      : null;

    res.json({
      totalDreams,
      monthlyDreams,
      weeklyDreams,
      topEmotions,
      topScenes,
      dreamTypes,
      avgAnxiety: avgAnxiety ? Math.round(avgAnxiety * 10) / 10 : null,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取统计数据失败' });
  }
});

export default router;
