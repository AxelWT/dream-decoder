import { prisma } from '../index.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SCHOOL_PROMPTS: Record<string, string> = {
  jung: `你是一位荣格心理学派的梦境分析师。你擅长从梦境中识别原型意象（阴影、阿尼玛/阿尼姆斯、自性）、集体无意识的象征，以及个体化过程的线索。你的分析温暖而深邃，引导做梦者探索内在的智慧。使用中文回复。

分析框架：
1. 识别梦境中的原型意象和象征
2. 探索阴影和未被整合的自我面向
3. 分析梦境与个体化进程的关联
4. 引导做梦者发现梦境的补偿功能
5. 关注梦境中的转化主题`,

  freud: `你是一位弗洛伊德精神分析学派的梦境分析师。你擅长识别梦境中的潜意识愿望、压抑的情感、梦的凝缩/置换/象征化机制。你的分析犀利而深入，帮助做梦者发现被压抑的欲望和冲突。使用中文回复。

分析框架：
1. 区分显梦内容和隐梦思想
2. 识别梦的工作机制（凝缩、置换、象征化）
3. 探索潜意识愿望和压抑的情感
4. 分析童年经历和早期关系模式
5. 关注梦境中的性象征和攻击性表达`,

  cognitive: `你是一位认知心理学派的梦境分析师。你关注梦境如何反映日间残留、情绪调节、记忆巩固和问题解决过程。你的分析理性而实用，帮助做梦者理解梦境与清醒思维的联系。使用中文回复。

分析框架：
1. 识别日间残留和近期经历的影响
2. 分析梦境中的情绪调节功能
3. 探索梦境与记忆巩固的关系
4. 关注梦境中的问题解决和创造力
5. 分析梦境内容与清醒认知模式的联系`,

  integrated: `你是一位整合派梦境分析师，融合荣格、弗洛伊德和认知心理学的洞见。你能灵活运用不同学派的视角，为做梦者提供全面而个性化的分析。你的回复温暖、深入且实用。使用中文回复。

分析框架：
1. 从多学派视角解读梦境象征
2. 整合潜意识愿望、原型意象和认知模式
3. 关注做梦者的个人背景和当前处境
4. 提供可操作的自我探索建议
5. 帮助做梦者建立与梦境的持续对话`,
};

export async function* streamChat(params: {
  userId: string;
  message: string;
  sessionId?: string;
  dreamId?: string;
  school: string;
}) {
  const { userId, message, sessionId, dreamId, school } = params;

  // Get or create session
  let session;
  let history: ChatMessage[] = [];

  if (sessionId) {
    session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session) {
      throw new Error('对话不存在');
    }

    history = session.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
  } else {
    session = await prisma.chatSession.create({
      data: {
        userId,
        dreamId: dreamId || null,
        school,
        title: message.slice(0, 50),
      },
    });
  }

  // Get dream context if dreamId provided
  let dreamContext = '';
  if (dreamId) {
    const dream = await prisma.dream.findFirst({
      where: { id: dreamId, userId },
    });
    if (dream) {
      dreamContext = `\n\n[梦境记录]\n标题: ${dream.title || '无标题'}\n内容: ${dream.content}\n情绪: ${dream.emotions.join(', ')}\n清晰度: ${dream.clarity || '未知'}\n类型: ${dream.dreamType || '未知'}`;
    }
  }

  // Get user profile context
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
    if (parts.length) {
      profileContext = `\n\n[做梦者背景]\n${parts.join('\n')}`;
    }
  }

  const systemPrompt = SCHOOL_PROMPTS[school] + profileContext + dreamContext;

  // Save user message
  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: 'user',
      content: message,
    },
  });

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  // Call DeepSeek API
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: true,
      max_tokens: 2000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('DeepSeek API error:', errText);
    throw new Error('AI 服务暂时不可用，请稍后重试');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取 AI 响应');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          yield content;
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }

  // Save assistant message
  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: 'assistant',
      content: fullContent,
    },
  });

  // Auto-extract aiSummary and anxietyScore if linked to a dream
  if (dreamId) {
    try {
      const extractionPrompt = `请分析以下梦境对话，返回 JSON 格式（不要包含其他文字，只返回 JSON）：
{"summary": "一句话梦境摘要", "anxietyScore": 0-10 的焦虑指数}

[对话内容]
用户: ${message}
AI: ${fullContent}`;

      const extractResponse = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: extractionPrompt }],
          stream: false,
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (extractResponse.ok) {
        const extractData = await extractResponse.json();
        const content = extractData.choices?.[0]?.message?.content || '';
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
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
      // Non-critical: log but don't fail the stream
      console.error('Failed to extract aiSummary/anxietyScore:', err);
    }
  }

  // Return session info at the end
  yield `\n[SESSION_ID:${session.id}]`;
}
