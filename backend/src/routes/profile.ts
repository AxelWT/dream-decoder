/**
 * 用户档案路由模块
 *
 * 职责：处理用户个人档案的查看与更新，包括头像上传和个人统计信息
 *
 * 路由端点列表（均需鉴权）：
 *  GET  /api/profile         - 获取用户信息和档案
 *  PUT  /api/profile/avatar  - 更新用户头像
 *  PUT  /api/profile         - 更新用户档案
 *  GET  /api/profile/stats   - 获取用户个人统计数据
 */
import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { profileSchema } from '../utils/validator.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 所有档案路由均需通过鉴权中间件
router.use(authMiddleware);

/**
 * GET /api/profile
 * 获取当前用户的基本信息和档案
 *
 * 响应格式：
 *   {
 *     user: { id, email, nickname, avatar, createdAt },  - 用户基本信息
 *     profile: Profile | null                            - 用户档案（可能未创建）
 *   }
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // 查询用户信息及其关联的档案
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 返回用户基本信息（过滤敏感字段）和档案
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

/**
 * PUT /api/profile/avatar
 * 更新用户头像
 *
 * 请求参数：
 *   body.avatar - Base64 编码的图片字符串（编码后最大约 2MB）
 *
 * 响应格式：
 *   成功: { id: string, avatar: string } - 更新后的用户 ID 和头像
 *   失败(400): { error: string } - 头像数据无效或文件过大
 */
router.put('/avatar', async (req: AuthRequest, res: Response) => {
  try {
    const { avatar } = req.body;
    // 校验头像数据是否为非空字符串
    if (!avatar || typeof avatar !== 'string') {
      return res.status(400).json({ error: '请提供头像数据' });
    }

    // 校验 Base64 图片大小（编码后约 2.8MB 对应原始约 2MB）
    if (avatar.length > 2_800_000) {
      return res.status(400).json({ error: '头像文件过大，请压缩后重试' });
    }

    // 更新用户头像字段
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

/**
 * PUT /api/profile
 * 更新用户档案信息（不存在则创建）
 *
 * 请求参数（通过 profileSchema 校验）：
 *   body.concerns    - 关注领域/担忧事项数组（可选）
 *   body.lifeChanges - 生活变化数组（可选）
 *   body.其他字段     - profileSchema 定义的其他档案字段
 *
 * 响应格式：
 *   成功: { ...profile } - 更新后的档案对象
 *   失败: { error: string } - 校验失败或更新错误
 */
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    // 校验档案数据格式
    const data = profileSchema.parse(req.body);

    // 使用 upsert：若档案已存在则更新，否则创建新档案
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId! },
      update: data,
      create: {
        userId: req.userId!,
        ...data,
        // 确保 concerns 和 lifeChanges 有默认值
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

/**
 * GET /api/profile/stats
 * 获取当前用户的个人统计数据
 *
 * 响应格式：
 *   {
 *     totalDreams: number,                              - 梦境总数
 *     monthlyDreams: number,                            - 本月梦境数
 *     topEmotions: { emotion: string, count: number }[] - Top5 情绪
 *   }
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    // 本月第一天（用于统计本月梦境数）
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 并行查询统计数据
    const [totalDreams, monthlyDreams, emotions] = await Promise.all([
      prisma.dream.count({ where: { userId } }),
      prisma.dream.count({
        where: { userId, recordedAt: { gte: startOfMonth } },
      }),
      // 查询所有梦境的情绪标签用于频次统计
      prisma.dream.findMany({
        where: { userId },
        select: { emotions: true },
      }),
    ]);

    // 统计情绪频次，取 Top5
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
