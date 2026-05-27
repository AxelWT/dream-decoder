import { z } from 'zod';

export const emailSchema = z.string().email('请输入有效的邮箱地址');

export const loginPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
});

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(1, '请输入昵称').max(20, '昵称最多20字符').optional(),
});

export const dreamSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().min(1, '请输入梦境内容').max(5000),
  emotions: z.array(z.string()).optional().default([]),
  clarity: z.enum(['blurry', 'normal', 'clear', 'vivid']).optional(),
  dreamType: z.enum(['nightmare', 'recurring', 'lucid', 'normal']).optional(),
  scenes: z.array(z.string()).optional().default([]),
  recordedAt: z.string().datetime().optional(),
});

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

export const chatSchema = z.object({
  dreamId: z.string().optional(),
  sessionId: z.string().optional(),
  message: z.string().min(1, '请输入消息').max(2000),
  school: z.enum(['jung', 'freud', 'cognitive', 'integrated']).optional().default('integrated'),
});
