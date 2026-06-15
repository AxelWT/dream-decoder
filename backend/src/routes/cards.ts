/**
 * 梦境视觉卡片路由模块
 *
 * 职责：处理梦境视觉卡片的生成、查询和删除操作
 *       梦境卡片是从梦境内容中提取象征符号、主题和 AI 语录生成的可视化卡片
 *
 * 路由端点列表（均需鉴权）：
 *  POST   /api/cards/generate  - 根据梦境生成视觉卡片
 *  GET    /api/cards           - 获取卡片列表（分页）
 *  GET    /api/cards/:id       - 获取卡片详情
 *  DELETE /api/cards/:id       - 删除卡片
 */
import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 所有卡片路由均需通过鉴权中间件
router.use(authMiddleware);

// 支持的卡片视觉风格
const CARD_STYLES = ['mystic', 'watercolor', 'minimal', 'surreal'] as const;

/**
 * POST /api/cards/generate
 * 根据指定梦境生成视觉卡片
 *
 * 请求参数：
 *   body.dreamId - 梦境 ID（必填）
 *   body.style   - 卡片风格（可选，默认 mystic，可选值: mystic / watercolor / minimal / surreal）
 *
 * 响应格式：
 *   成功: { ...card, dream: { id, title, recordedAt } } - 生成的卡片（含关联梦境信息）
 *   失败(400): { error: '请提供梦境ID' }
 *   失败(404): { error: '梦境不存在' }
 */
router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const { dreamId, style } = req.body;

    // 校验必填参数
    if (!dreamId) {
      return res.status(400).json({ error: '请提供梦境ID' });
    }

    // 校验卡片风格，非法值回退为默认风格 mystic
    const cardStyle = CARD_STYLES.includes(style) ? style : 'mystic';

    // 查询梦境详情，确保梦境存在且属于当前用户
    const dream = await prisma.dream.findFirst({
      where: { id: dreamId, userId: req.userId! },
      include: {
        // 包含最新的1个对话会话及其最新5条消息，用于提取 AI 语录
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

    // 从梦境内容和场景中提取象征符号
    const symbols = extractSymbols(dream.content, dream.scenes);
    // 提取卡片主题，优先使用 AI 摘要，其次使用标题，最后使用默认值
    const theme = dream.aiSummary || dream.title || '潜意识的低语';

    // 从 AI 对话中提取一句有意义的语录作为卡片文案
    let quote = '';
    if (dream.sessions.length > 0 && dream.sessions[0].messages.length > 0) {
      // 筛选 AI 回复消息
      const aiMessages = dream.sessions[0].messages.filter((m) => m.role === 'assistant');
      if (aiMessages.length > 0) {
        // 从最后一条 AI 消息中提取有意义的句子
        const lastMsg = aiMessages[0].content;
        // 按标点分割句子，过滤掉过短的句子
        const sentences = lastMsg.split(/[。！？.!?]/).filter((s) => s.trim().length > 10);
        if (sentences.length > 0) {
          // 取第3句（如不够则取最后一句），通常中间的句子更有总结性
          quote = sentences[Math.min(2, sentences.length - 1)].trim();
        }
      }
    }
    // 若未找到合适语录，使用默认文案
    if (!quote) {
      quote = '你的潜意识正在诉说着一些重要的事情。';
    }

    // 创建梦境卡片记录
    const card = await prisma.dreamCard.create({
      data: {
        userId: req.userId!,
        dreamId,
        style: cardStyle,
        title: dream.title || theme.slice(0, 50),
        symbols,
        theme,
        quote,
        // 使用关联会话的心理学学派，默认为综合学派
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

/**
 * GET /api/cards
 * 获取当前用户的卡片列表（分页）
 *
 * 查询参数：
 *   query.page  - 页码（默认 1，最小 1）
 *   query.limit - 每页数量（默认 20，范围 1-50）
 *
 * 响应格式：
 *   { cards: Card[], total: number, page: number, totalPages: number }
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // 解析分页参数，确保在合理范围内
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // 并行查询卡片列表和总数
    const [cards, total] = await Promise.all([
      prisma.dreamCard.findMany({
        where: { userId: req.userId! },
        // 按创建时间倒序排列
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          // 关联梦境的基本信息
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

/**
 * GET /api/cards/:id
 * 获取指定卡片的详情
 *
 * 路径参数：
 *   params.id - 卡片 ID
 *
 * 响应格式：
 *   成功: { ...card, dream: { id, title, content, recordedAt } } - 卡片详情（含梦境完整内容）
 *   失败(404): { error: '卡片不存在' }
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // 查询卡片详情，确保只能查看自己的卡片
    const card = await prisma.dreamCard.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        // 关联梦境的详细信息（含完整内容）
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

/**
 * DELETE /api/cards/:id
 * 删除指定卡片
 *
 * 路径参数：
 *   params.id - 卡片 ID
 *
 * 响应格式：
 *   成功: { success: true }
 *   失败(404): { error: '卡片不存在' }
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // 先检查卡片是否存在且属于当前用户
    const card = await prisma.dreamCard.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!card) {
      return res.status(404).json({ error: '卡片不存在' });
    }

    // 执行删除操作
    await prisma.dreamCard.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || '删除卡片失败' });
  }
});

/**
 * 从梦境内容中提取象征符号
 *
 * 提取逻辑：
 *   1. 将场景标签作为初始符号集合
 *   2. 使用正则匹配梦境内容中的常见梦境意象（水、飞行、坠落等）
 *   3. 合并去重后返回，最多 8 个符号
 *
 * @param content - 梦境文本内容
 * @param scenes  - 场景标签数组
 * @returns 提取的象征符号数组（最多8个）
 */
function extractSymbols(content: string, scenes: string[]): string[] {
  // 以场景标签作为基础符号集合
  const symbols: Set<string> = new Set(scenes);

  // 常见梦境象征符号的正则匹配规则：[正则表达式, 符号名称]
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

  // 遍历匹配规则，如果内容命中则添加对应符号
  for (const [pattern, symbol] of symbolPatterns) {
    if (pattern.test(content)) {
      symbols.add(symbol);
    }
  }

  // 转为数组并限制最多 8 个符号
  return Array.from(symbols).slice(0, 8);
}

export default router;
