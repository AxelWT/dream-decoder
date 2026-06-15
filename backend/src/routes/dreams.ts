/**
 * 梦境 CRUD 路由模块
 *
 * 职责：处理梦境记录的增删改查操作，所有路由均需鉴权
 *
 * 路由端点列表（均需鉴权）：
 *  POST   /api/dreams      - 创建梦境记录
 *  GET    /api/dreams      - 获取梦境列表（分页）
 *  GET    /api/dreams/:id  - 获取梦境详情（含对话会话）
 *  PUT    /api/dreams/:id  - 更新梦境记录
 *  DELETE /api/dreams/:id  - 删除梦境记录
 */
import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { dreamSchema, updateDreamSchema } from '../utils/validator.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { scoreAnxiety } from '../services/deepseek.js';

const router = Router();

// 所有梦境路由均需通过鉴权中间件
router.use(authMiddleware);

/**
 * POST /api/dreams
 * 创建梦境记录
 *
 * 请求参数：
 *   body.title       - 梦境标题
 *   body.content     - 梦境内容描述
 *   body.emotions    - 情绪标签数组
 *   body.clarity     - 清晰度
 *   body.dreamType   - 梦境类型
 *   body.scenes      - 场景标签数组
 *   body.recordedAt  - 记录时间（可选，默认当前时间）
 *
 * 响应格式：
 *   成功: { ...dream } - 创建的梦境对象
 *   失败: { error: string } - 错误信息
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    // 校验梦境数据格式
    const data = dreamSchema.parse(req.body);

    // 创建梦境记录
    const dream = await prisma.dream.create({
      data: {
        userId: req.userId!,
        title: data.title,
        content: data.content,
        emotions: data.emotions,
        clarity: data.clarity,
        dreamType: data.dreamType,
        scenes: data.scenes,
        // 若未指定记录时间则使用当前时间
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
      },
    });

    // 后台异步生成焦虑指数，不阻塞响应
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

/**
 * GET /api/dreams
 * 获取当前用户的梦境列表（分页）
 *
 * 查询参数：
 *   query.page  - 页码（默认 1，最小 1）
 *   query.limit - 每页数量（默认 20，范围 1-50）
 *
 * 响应格式：
 *   { dreams: Dream[], total: number, page: number, totalPages: number }
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // 解析分页参数，确保在合理范围内
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // 并行查询梦境列表和总数
    const [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where: { userId: req.userId! },
        // 按记录时间倒序排列
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

/**
 * GET /api/dreams/:id
 * 获取指定梦境的详情（包含关联的对话会话）
 *
 * 路径参数：
 *   params.id - 梦境 ID
 *
 * 响应格式：
 *   成功: { ...dream, sessions: Session[] } - 梦境详情（含按时间倒序排列的会话）
 *   失败(404): { error: '梦境不存在' }
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // 查询梦境详情，确保只能查看自己的梦境
    const dream = await prisma.dream.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      // 包含关联的 AI 对话会话，按创建时间倒序
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

/**
 * PUT /api/dreams/:id
 * 更新梦境记录
 *
 * 路径参数：
 *   params.id - 梦境 ID
 *
 * 请求参数：
 *   body - 部分更新字段（通过 updateDreamSchema 校验）
 *
 * 响应格式：
 *   成功: { ...dream } - 更新后的梦境对象
 *   失败(404): { error: '梦境不存在' }
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // 校验更新数据格式
    const data = updateDreamSchema.parse(req.body);

    // 先检查梦境是否存在且属于当前用户
    const existing = await prisma.dream.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: '梦境不存在' });
    }

    // 执行更新操作
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

/**
 * DELETE /api/dreams/:id
 * 删除梦境记录
 *
 * 路径参数：
 *   params.id - 梦境 ID
 *
 * 响应格式：
 *   成功: { success: true }
 *   失败(404): { error: '梦境不存在' }
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // 先检查梦境是否存在且属于当前用户
    const dream = await prisma.dream.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!dream) {
      return res.status(404).json({ error: '梦境不存在' });
    }

    // 执行删除操作
    await prisma.dream.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '删除梦境失败' });
  }
});

export default router;
