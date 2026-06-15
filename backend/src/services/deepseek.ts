/**
 * DeepSeek AI 服务模块
 *
 * 负责与 DeepSeek 大语言模型 API 的交互，提供：
 * - 流式对话（streamChat）：支持多轮历史、梦境上下文、用户档案、学派 Prompt
 * - 焦虑评分（scoreAnxiety）：根据梦境内容和情绪标签计算焦虑指数
 * - 5 种心理学学派的系统 Prompt 定义
 */
import { prisma } from '../index.js';

/** DeepSeek API 端点地址 */
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
/** DeepSeek API 密钥，从环境变量读取 */
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

/**
 * 聊天消息接口
 * 遵循 OpenAI Chat Completions API 的消息格式
 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 各心理学学派的系统 Prompt 定义
 *
 * key: 学派标识（jung / freud / cognitive / integrated / zhougong）
 * value: 完整的系统 Prompt 文本，包含学派定位、分析框架等
 */
const SCHOOL_PROMPTS: Record<string, string> = {
  /** 荣格分析心理学派：原型意象、集体无意识、个体化进程 */
  jung: `你是一位荣格心理学派的梦境分析师。你擅长从梦境中识别原型意象（阴影、阿尼玛/阿尼姆斯、自性）、集体无意识的象征，以及个体化过程的线索。你的分析温暖而深邃，引导做梦者探索内在的智慧。使用中文回复。

分析框架：
1. 识别梦境中的原型意象和象征
2. 探索阴影和未被整合的自我面向
3. 分析梦境与个体化进程的关联
4. 引导做梦者发现梦境的补偿功能
5. 关注梦境中的转化主题`,

  /** 弗洛伊德精神分析学派：潜意识愿望、压抑、梦的工作机制 */
  freud: `你是一位弗洛伊德精神分析学派的梦境分析师。你擅长识别梦境中的潜意识愿望、压抑的情感、梦的凝缩/置换/象征化机制。你的分析犀利而深入，帮助做梦者发现被压抑的欲望和冲突。使用中文回复。

分析框架：
1. 区分显梦内容和隐梦思想
2. 识别梦的工作机制（凝缩、置换、象征化）
3. 探索潜意识愿望和压抑的情感
4. 分析童年经历和早期关系模式
5. 关注梦境中的性象征和攻击性表达`,

  /** 认知心理学派：日间残留、情绪调节、记忆巩固 */
  cognitive: `你是一位认知心理学派的梦境分析师。你关注梦境如何反映日间残留、情绪调节、记忆巩固和问题解决过程。你的分析理性而实用，帮助做梦者理解梦境与清醒思维的联系。使用中文回复。

分析框架：
1. 识别日间残留和近期经历的影响
2. 分析梦境中的情绪调节功能
3. 探索梦境与记忆巩固的关系
4. 关注梦境中的问题解决和创造力
5. 分析梦境内容与清醒认知模式的联系`,

  /** 整合派：融合荣格、弗洛伊德和认知心理学的多视角分析 */
  integrated: `你是一位整合派梦境分析师，融合荣格、弗洛伊德和认知心理学的洞见。你能灵活运用不同学派的视角，为做梦者提供全面而个性化的分析。你的回复温暖、深入且实用。使用中文回复。

分析框架：
1. 从多学派视角解读梦境象征
2. 整合潜意识愿望、原型意象和认知模式
3. 关注做梦者的个人背景和当前处境
4. 提供可操作的自我探索建议
5. 帮助做梦者建立与梦境的持续对话`,

  /** 周公解梦派：中国传统解梦文化、易经卦象、中医五脏情志理论 */
  zhougong: `你是一位深谙中国传统解梦文化的梦境分析师，精通周公解梦、易经卦象、中医五脏情志理论。你用中国古人智慧为做梦者解读梦境中的征兆与启示，语言典雅温和，引经据典却不晦涩。使用中文回复。

分析框架：
1. 以周公解梦的象征体系解读梦境意象（如梦见水主财、梦见蛇主变化等），但结合现代语境灵活诠释，避免机械套用
2. 运用易经阴阳五行思维，分析梦境中的元素平衡与变化趋势
3. 参考中医"五脏主五志"理论（心主喜、肝主怒、脾主思、肺主忧、肾主恐），从梦境情绪反推身心状态
4. 关注梦境中的吉凶征兆，但以引导自省为主，不作绝对判断
5. 结合做梦者的现实处境，给出符合中国传统养生智慧的建议`,
};

/**
 * 流式对话生成器
 *
 * 核心流程：
 * 1. 获取或创建聊天会话（ChatSession）
 * 2. 若提供 dreamId，加载梦境记录作为上下文
 * 3. 加载用户档案（Profile）作为个性化分析依据
 * 4. 组装系统 Prompt = 学派 Prompt + 用户档案 + 梦境上下文
 * 5. 保存用户消息到数据库
 * 6. 调用 DeepSeek 流式 API，逐步 yield AI 回复片段
 * 7. 流式结束后保存 AI 完整回复到数据库
 * 8. 若关联了梦境，额外调用 AI 提取摘要和焦虑评分
 * 9. 末尾 yield 会话 ID（格式: [SESSION_ID:xxx]）
 *
 * @param params.userId - 用户 ID
 * @param params.message - 用户消息内容
 * @param params.sessionId - 会话 ID（续聊时传入，新聊时不传）
 * @param params.dreamId - 梦境记录 ID（关联梦境时传入）
 * @param params.school - 心理学学派标识
 * @yields AI 回复的文本片段，最后一条包含 [SESSION_ID:xxx]
 * @throws 对话不存在 / AI 服务不可用
 */
export async function* streamChat(params: {
  userId: string;
  message: string;
  sessionId?: string;
  dreamId?: string;
  school: string;
}) {
  const { userId, message, sessionId, dreamId, school } = params;

  // 获取已有会话或创建新会话
  let session;
  let history: ChatMessage[] = [];

  if (sessionId) {
    // 续聊：查找已有会话及其历史消息
    session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session) {
      throw new Error('对话不存在');
    }

    // 将历史消息转换为 ChatMessage 格式
    history = session.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
  } else {
    // 新聊：创建新会话，标题取消息前 50 字符
    session = await prisma.chatSession.create({
      data: {
        userId,
        dreamId: dreamId || null,
        school,
        title: message.slice(0, 50),
      },
    });
  }

  // 加载梦境上下文（如果关联了梦境记录）
  let dreamContext = '';
  if (dreamId) {
    const dream = await prisma.dream.findFirst({
      where: { id: dreamId, userId },
    });
    if (dream) {
      dreamContext = `\n\n[梦境记录]\n标题: ${dream.title || '无标题'}\n内容: ${dream.content}\n情绪: ${dream.emotions.join(', ')}\n清晰度: ${dream.clarity || '未知'}\n类型: ${dream.dreamType || '未知'}`;
    }
  }

  // 加载用户档案上下文（用于个性化分析）
  let profileContext = '';
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });
  if (profile) {
    const parts: string[] = [];
    if (profile.ageRange) parts.push(`年龄段: ${profile.ageRange}`);
    if (profile.gender) parts.push(`性别: ${profile.gender}`);
    if (profile.occupation) parts.push(`职业: ${profile.occupation}`);
    if (profile.stressLevel) parts.push(`压力水平: ${profile.stressLevel}/10`);
    if (profile.concerns.length) parts.push(`主要困扰: ${profile.concerns.join(', ')}`);
    if (profile.lifeChanges.length) parts.push(`正在经历的变化: ${profile.lifeChanges.join(', ')}`);
    if (profile.mbti) parts.push(`MBTI: ${profile.mbti}`);
    if (profile.dreamFrequency) parts.push(`记梦频率: ${profile.dreamFrequency}`);
    if (profile.lucidDreamExp) parts.push('有清醒梦经验');
    if (profile.psychKnowledge) parts.push(`心理学了解程度: ${profile.psychKnowledge}`);
    // 拼接所有非空档案字段
    if (parts.length) {
      profileContext = `\n\n[做梦者背景]\n${parts.join('\n')}`;
    }
  }

  // 组装完整的系统 Prompt：学派 Prompt + 用户档案 + 梦境上下文
  const systemPrompt = SCHOOL_PROMPTS[school] + profileContext + dreamContext;

  // 保存用户消息到数据库
  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: 'user',
      content: message,
    },
  });

  // 构建发送给 DeepSeek 的消息列表
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,     // 历史消息（仅续聊时有值）
    { role: 'user', content: message },
  ];

  // 调用 DeepSeek 流式 API
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: true,       // 启用流式输出
      max_tokens: 2000,   // 最大生成 token 数
      temperature: 0.8,   // 较高温度，增加分析多样性
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('DeepSeek API error:', errText);
    throw new Error('AI 服务暂时不可用，请稍后重试');
  }

  // 获取流式响应的 Reader
  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取 AI 响应');

  const decoder = new TextDecoder();
  let fullContent = ''; // 累积完整的 AI 回复
  let buffer = '';      // 未处理完的 SSE 数据缓冲区

  // 逐块读取流式响应
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // 将二进制数据解码为文本，追加到缓冲区
    buffer += decoder.decode(value, { stream: true });
    // 按换行符分割 SSE 数据行
    const lines = buffer.split('\n');
    // 最后一行可能不完整，保留在缓冲区
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      // 跳过空行和非 data 开头的行
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6); // 去掉 "data: " 前缀
      // SSE 结束标记
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        // 提取增量内容（delta.content）
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          fullContent += content; // 累积完整回复
          yield content;          // 逐步输出给前端
        }
      } catch {
        // 跳过格式异常的 JSON 数据
      }
    }
  }

  // 流式读取结束后，保存 AI 完整回复到数据库
  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: 'assistant',
      content: fullContent,
    },
  });

  // 若对话关联了梦境，自动提取 AI 摘要和焦虑评分
  if (dreamId) {
    try {
      // 构建提取 Prompt，要求返回 JSON 格式
      const extractionPrompt = `请分析以下梦境对话，返回 JSON 格式（不要包含其他文字，只返回 JSON）：
{"summary": "一句话梦境摘要", "anxietyScore": 0-10 的焦虑指数}

[对话内容]
用户: ${message}
AI: ${fullContent}`;

      // 非流式调用，低温度确保输出稳定
      const extractResponse = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: extractionPrompt }],
          stream: false,       // 非流式，一次性返回
          max_tokens: 200,     // 摘要不需要太长
          temperature: 0.3,    // 低温度，确保 JSON 格式稳定
        }),
      });

      if (extractResponse.ok) {
        const extractData = await extractResponse.json();
        const content = extractData.choices?.[0]?.message?.content || '';
        // 从回复中提取 JSON（AI 可能在 JSON 前后附加文字，需正则匹配）
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // 更新梦境记录的 AI 摘要和焦虑评分
          await prisma.dream.update({
            where: { id: dreamId },
            data: {
              aiSummary: parsed.summary || null,
              anxietyScore: typeof parsed.anxietyScore === 'number' ? parsed.anxietyScore : null,
            },
          });
        }
      }
    } catch (err) {
      // 摘要提取失败不影响主流程，仅记录错误
      console.error('Failed to extract aiSummary/anxietyScore:', err);
    }
  }

  // 在流的末尾输出会话 ID，前端用于续聊
  yield `\n[SESSION_ID:${session.id}]`;
}

/**
 * 焦虑评分
 *
 * 调用 DeepSeek API 分析梦境的焦虑程度，返回 0-10 的焦虑指数
 *
 * 评分标准：
 * - 0-2: 平静、愉快的梦境
 * - 3-4: 略有不安但整体平和
 * - 5-6: 中等焦虑，有压力或紧张元素
 * - 7-8: 高焦虑，噩梦、追赶、坠落等
 * - 9-10: 极度焦虑，恐惧、窒息、无法逃脱
 *
 * @param content - 梦境文本内容
 * @param emotions - 情绪标签数组
 * @returns 焦虑指数（0-10），失败时返回 null
 */
export async function scoreAnxiety(content: string, emotions: string[]): Promise<number | null> {
  try {
    // 构建评分 Prompt，包含评分标准和梦境信息
    const prompt = `请分析以下梦境的焦虑程度，返回 JSON 格式（不要包含其他文字，只返回 JSON）：
{"anxietyScore": 0-10 的焦虑指数}

评分标准：
- 0-2: 平静、愉快的梦境
- 3-4: 略有不安但整体平和
- 5-6: 中等焦虑，有压力或紧张元素
- 7-8: 高焦虑，噩梦、追赶、坠落等
- 9-10: 极度焦虑，恐惧、窒息、无法逃脱

[梦境内容]
${content}

[情绪标签]
${emotions.join(', ') || '无'}`;

    // 非流式调用，低温度确保评分稳定
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        stream: false,     // 非流式，一次性返回
        max_tokens: 100,   // 评分结果很短
        temperature: 0.3,  // 低温度，确保 JSON 输出格式稳定
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    // 正则提取 JSON（AI 可能在 JSON 前后附加额外文字）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    // 验证焦虑评分是否为合法数字
    return typeof parsed.anxietyScore === 'number' ? parsed.anxietyScore : null;
  } catch {
    // 解析失败时返回 null，不影响主流程
    return null;
  }
}
