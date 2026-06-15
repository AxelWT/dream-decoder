/**
 * Zod 请求体验证模块
 *
 * 定义各接口的请求体校验 Schema，基于 Zod 库实现运行时类型校验。
 * 每个导出的 Schema 对应一个 API 接口的入参结构，用于在路由层拦截非法请求。
 */
import { z } from 'zod';

/** 邮箱格式校验：标准邮箱地址 */
export const emailSchema = z.string().email('请输入有效的邮箱地址');

/**
 * 登录请求体校验
 * - email：必填，合法邮箱
 * - password：必填，最少 6 位
 */
export const loginPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
});

/**
 * 注册请求体校验
 * - email：必填，合法邮箱
 * - password：必填，最少 6 位
 * - nickname：可选，1~20 字符
 * - code：必填，6 位数字验证码（固定长度）
 */
export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(1, '请输入昵称').max(20, '昵称最多20字符').optional(),
  code: z.string().length(6, '验证码为6位'),
});

/**
 * 创建梦境请求体校验
 * - title：可选，最多 100 字符
 * - content：必填，1~5000 字符
 * - emotions：可选，字符串数组，缺省为空数组
 * - clarity：可选，梦境清晰度（blurry=模糊 / normal=一般 / clear=清晰 / vivid=逼真）
 * - dreamType：可选，梦境类型（nightmare=噩梦 / recurring=反复 / lucid=清醒梦 / normal=普通）
 * - scenes：可选，场景标签数组，缺省为空数组
 * - recordedAt：可选，ISO 8601 日期时间字符串
 */
export const dreamSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().min(1, '请输入梦境内容').max(5000),
  emotions: z.array(z.string()).optional().default([]),
  clarity: z.enum(['blurry', 'normal', 'clear', 'vivid']).optional(),
  dreamType: z.enum(['nightmare', 'recurring', 'lucid', 'normal']).optional(),
  scenes: z.array(z.string()).optional().default([]),
  recordedAt: z.string().datetime().optional(),
});

/**
 * 用户画像请求体校验
 * 所有字段均为可选，用于收集用户背景信息以辅助梦境解析
 * - ageRange：年龄段
 * - gender：性别
 * - occupation：职业
 * - stressLevel：压力水平，1~10 整数
 * - concerns：关注事项列表
 * - lifeChanges：近期生活变化列表
 * - mbti：MBTI 人格类型
 * - dreamFrequency：做梦频率
 * - lucidDreamExp：是否有清醒梦体验
 * - psychKnowledge：心理学知识水平
 * - preferredSchool：偏好心理学流派
 */
export const profileSchema = z.object({
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  concerns: z.array(z.string()).optional(),
  lifeChanges: z.array(z.string()).optional(),
  mbti: z.string().optional(),
  dreamFrequency: z.string().optional(),
  lucidDreamExp: z.boolean().optional(),
  psychKnowledge: z.string().optional(),
  preferredSchool: z.string().optional(),
});

/**
 * 更新梦境请求体校验
 * 与 dreamSchema 类似，但 content 改为可选（允许只修改标题等部分字段）
 * - title：可选，最多 100 字符
 * - content：可选，1~5000 字符
 * - emotions：可选，字符串数组（无缺省值，前端需显式传入）
 * - clarity：可选，同 dreamSchema
 * - dreamType：可选，同 dreamSchema
 * - scenes：可选，字符串数组（无缺省值）
 */
export const updateDreamSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().min(1, '请输入梦境内容').max(5000).optional(),
  emotions: z.array(z.string()).optional(),
  clarity: z.enum(['blurry', 'normal', 'clear', 'vivid']).optional(),
  dreamType: z.enum(['nightmare', 'recurring', 'lucid', 'normal']).optional(),
  scenes: z.array(z.string()).optional(),
});

/**
 * 聊天对话请求体校验
 * - dreamId：可选，关联的梦境 ID（首次对话时可不传）
 * - sessionId：可选，会话 ID（续聊时传入以保持上下文）
 * - message：必填，1~2000 字符
 * - school：可选，解析流派（jung=荣格 / freud=弗洛伊德 / cognitive=认知 / integrated=综合 / zhougong=周公），缺省为综合
 */
export const chatSchema = z.object({
  dreamId: z.string().optional(),
  sessionId: z.string().optional(),
  message: z.string().min(1, '请输入消息').max(2000),
  school: z.enum(['jung', 'freud', 'cognitive', 'integrated', 'zhougong']).optional().default('integrated'),
});
