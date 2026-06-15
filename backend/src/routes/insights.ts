/**
 * 数据洞察路由模块
 *
 * 职责：提供梦境数据的统计分析和可视化所需的数据接口
 *
 * 路由端点列表（均需鉴权）：
 *  GET  /api/insights/anxiety-curve     - 获取焦虑指数曲线数据
 *  GET  /api/insights/theme-cloud       - 获取主题词云数据（情绪/场景/类型频次）
 *  GET  /api/insights/stats             - 获取综合统计数据
 *  POST /api/insights/backfill-anxiety  - 批量补填缺失的焦虑指数
 */
import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { scoreAnxiety } from '../services/deepseek.js';

const router = Router();

// 所有洞察路由均需通过鉴权中间件
router.use(authMiddleware);

/**
 * GET /api/insights/anxiety-curve
 * 获取焦虑指数随时间变化的曲线数据
 *
 * 查询参数：
 *   query.days - 时间范围天数（默认 30，范围 1-365）
 *
 * 响应格式：
 *   {
 *     days: number,                      - 查询的天数范围
 *     dataPoints: {                      - 每日数据点数组
 *       date: string,                    - 日期（YYYY-MM-DD）
 *       score: number,                   - 焦虑指数
 *       dreamId: string,                 - 关联梦境 ID
 *       title: string,                   - 梦境标题
 *       emotions: string[]               - 情绪标签
 *     }[]
 *   }
 */
router.get('/anxiety-curve', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    // 限制天数范围在 1-365 之间
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    // 查询指定时间范围内的梦境数据
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
      // 按记录时间正序排列，用于绘制曲线
      orderBy: { recordedAt: 'asc' },
    });

    // 构建每日数据点，仅包含有焦虑指数的梦境
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

/**
 * GET /api/insights/theme-cloud
 * 获取主题词云数据，统计情绪、场景、梦境类型的出现频次
 *
 * 查询参数：
 *   query.days - 时间范围天数（默认 30，范围 1-365）
 *
 * 响应格式：
 *   {
 *     emotions: { name: string, count: number }[],   - 情绪频次（降序）
 *     scenes: { name: string, count: number }[],     - 场景频次（降序）
 *     types: { name: string, count: number }[],      - 梦境类型频次（降序）
 *     totalDreams: number                             - 梦境总数
 *   }
 */
router.get('/theme-cloud', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    // 查询指定时间范围内的梦境数据
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

    // 统计各类标签的出现频次
    const emotionCount: Record<string, number> = {};
    const sceneCount: Record<string, number> = {};
    const typeCount: Record<string, number> = {};

    for (const dream of dreams) {
      // 统计情绪标签频次
      for (const e of dream.emotions) {
        emotionCount[e] = (emotionCount[e] || 0) + 1;
      }
      // 统计场景标签频次
      for (const s of dream.scenes) {
        sceneCount[s] = (sceneCount[s] || 0) + 1;
      }
      // 统计梦境类型频次
      if (dream.dreamType) {
        typeCount[dream.dreamType] = (typeCount[dream.dreamType] || 0) + 1;
      }
    }

    // 将频次对象转换为数组并按频次降序排列
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

/**
 * GET /api/insights/stats
 * 获取综合统计数据，包括梦境数量、Top 情绪/场景、类型分布和平均焦虑指数
 *
 * 响应格式：
 *   {
 *     totalDreams: number,                              - 梦境总数
 *     monthlyDreams: number,                            - 本月梦境数
 *     weeklyDreams: number,                             - 本周梦境数
 *     topEmotions: { emotion: string, count: number }[], - Top5 情绪
 *     topScenes: { scene: string, count: number }[],     - Top5 场景
 *     dreamTypes: { type: string, count: number }[],     - 梦境类型分布
 *     avgAnxiety: number | null                          - 平均焦虑指数（保留1位小数）
 *   }
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    // 本月第一天（用于统计本月梦境数）
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // 本周第一天（周日，用于统计本周梦境数）
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // 并行查询各项统计数据
    const [totalDreams, monthlyDreams, weeklyDreams, allDreams] = await Promise.all([
      prisma.dream.count({ where: { userId } }),
      prisma.dream.count({ where: { userId, recordedAt: { gte: startOfMonth } } }),
      prisma.dream.count({ where: { userId, recordedAt: { gte: startOfWeek } } }),
      // 查询所有梦境的情绪、场景、类型和焦虑指数用于聚合统计
      prisma.dream.findMany({
        where: { userId },
        select: { emotions: true, scenes: true, dreamType: true, anxietyScore: true },
      }),
    ]);

    // 统计情绪频次，取 Top5
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

    // 统计场景频次，取 Top5
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

    // 统计梦境类型分布
    const typeCount: Record<string, number> = {};
    for (const dream of allDreams) {
      if (dream.dreamType) {
        typeCount[dream.dreamType] = (typeCount[dream.dreamType] || 0) + 1;
      }
    }
    const dreamTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    // 计算平均焦虑指数（仅统计有值的记录）
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
      // 焦虑指数保留1位小数
      avgAnxiety: avgAnxiety ? Math.round(avgAnxiety * 10) / 10 : null,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '获取统计数据失败' });
  }
});

/**
 * POST /api/insights/backfill-anxiety
 * 批量为缺少焦虑指数的梦境记录补填焦虑指数
 *
 * 请求参数：无（自动查找当前用户所有缺失焦虑指数的梦境）
 *
 * 响应格式：
 *   { processed: number, total: number } - 已处理数量和总数量
 *   或 { processed: 0, message: '所有梦境已有焦虑指数' } - 无需处理
 */
router.post('/backfill-anxiety', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // 查找所有缺少焦虑指数的梦境
    const dreams = await prisma.dream.findMany({
      where: { userId, anxietyScore: null },
      select: { id: true, content: true, emotions: true },
    });

    // 如果所有梦境都已有焦虑指数，直接返回
    if (dreams.length === 0) {
      return res.json({ processed: 0, message: '所有梦境已有焦虑指数' });
    }

    // 逐条调用 AI 服务生成焦虑指数并更新
    let processed = 0;
    for (const dream of dreams) {
      const score = await scoreAnxiety(dream.content, dream.emotions);
      if (score !== null) {
        await prisma.dream.update({
          where: { id: dream.id },
          data: { anxietyScore: score },
        });
        processed++;
      }
    }

    res.json({ processed, total: dreams.length });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '批量生成焦虑指数失败' });
  }
});

export default router;
