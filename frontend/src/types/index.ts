/**
 * TypeScript 类型定义和常量
 *
 * 职责：集中管理应用中所有的 TypeScript 接口、类型别名和枚举常量。
 * 包含用户、套餐、个人档案、梦境、聊天会话、API 响应、认证状态、表单数据等类型定义，
 * 以及各种选项列表和标签映射常量。
 */

// ======================== 用户相关类型 ========================

/** 用户信息接口 - 表示系统中的注册用户 */
export interface User {
  id: string;              // 用户唯一标识
  email: string;           // 用户邮箱，用于登录
  nickname: string | null; // 用户昵称，未设置时为 null
  avatar: string | null;   // 头像 URL，未设置时为 null
  credits: number;         // 剩余积分，用于 AI 分析扣费
  plan: string;            // 当前订阅套餐标识
  createdAt?: string;      // 账号创建时间（ISO 8601 格式）
  profile?: Profile | null; // 关联的用户个人档案
}

// ======================== 套餐相关类型 ========================

/** 订阅套餐接口 - 表示可购买的会员计划 */
export interface Plan {
  id: string;              // 套餐唯一标识
  name: string;            // 套餐名称（如"基础版"、"专业版"）
  price: number;           // 套餐价格
  currency: string;        // 货币单位（如 "cny"）
  interval: string;        // 计费周期（如 "month"、"year"）
  priceId?: string;        // 支付平台对应的价格 ID（如 Stripe Price ID）
  features: string[];      // 套餐包含的功能列表
}

// ======================== 个人档案相关类型 ========================

/** 用户个人档案接口 - 存储用户的心理画像与偏好信息，用于个性化分析 */
export interface Profile {
  id: string;                    // 档案唯一标识
  userId: string;                // 关联的用户 ID
  ageRange: string | null;       // 年龄段（如 "25-34"），未填写为 null
  gender: string | null;         // 性别，未填写为 null
  occupation: string | null;     // 职业，未填写为 null
  stressLevel: number | null;    // 压力等级（1-10），未填写为 null
  concerns: string[];            // 当前困扰列表（如 ["工作压力", "人际关系"]）
  lifeChanges: string[];         // 近期生活变化列表（如 ["换工作", "搬家"]）
  mbti: string | null;           // MBTI 人格类型（如 "INFP"），未填写为 null
  dreamFrequency: string | null; // 做梦频率，未填写为 null
  lucidDreamExp: boolean;        // 是否有过清醒梦体验
  psychKnowledge: string | null; // 心理学知识了解程度，未填写为 null
  preferredSchool: string | null; // 偏好的心理学派，未填写为 null
}

/** 档案统计接口 - 用户的梦境统计摘要信息 */
export interface ProfileStats {
  totalDreams: number;                          // 累计梦境总数
  monthlyDreams: number;                        // 当月梦境数
  topEmotions: { emotion: string; count: number }[]; // 高频情绪排行，按出现次数降序
}

// ======================== 个人档案选项常量 ========================

/** 年龄段选项列表 */
export const AGE_RANGE_OPTIONS = [
  '18岁以下', '18-24', '25-34', '35-44', '45-54', '55-64', '65岁以上',
];

/** 性别选项列表 */
export const GENDER_OPTIONS = [
  '男', '女', '非二元', '不愿透露',
];

/** MBTI 人格类型选项列表 - 包含 16 种类型 */
export const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

/** 做梦频率选项 - value 为存储值，label 为显示文本 */
export const DREAM_FREQUENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周几次' },
  { value: 'monthly', label: '每月几次' },
  { value: 'rare', label: '很少记起' },
];

/** 心理学知识了解程度选项 - value 为存储值，label 为显示文本 */
export const PSYCH_KNOWLEDGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: '完全不了解' },
  { value: 'basic', label: '略有耳闻' },
  { value: 'intermediate', label: '有一定了解' },
  { value: 'advanced', label: '较为熟悉' },
];

/** 当前困扰选项列表 - 用于档案编辑页的多选 */
export const CONCERN_OPTIONS = [
  '工作压力', '人际关系', '情感关系', '家庭问题', '学业压力',
  '健康问题', '经济压力', '自我认同', '未来迷茫', '睡眠质量',
];

/** 近期生活变化选项列表 - 用于档案编辑页的多选 */
export const LIFE_CHANGE_OPTIONS = [
  '换工作', '搬家', '恋爱/结婚', '分手/离婚', '亲人离世',
  '升学', '创业', '退休', '生育', '健康变化',
];

// ======================== 梦境相关类型 ========================

/** 梦境清晰度类型 - 表示用户对梦境画面清晰程度的主观评价 */
export type Clarity = 'blurry' | 'normal' | 'clear' | 'vivid';

/** 梦境类型 - 表示梦境的分类 */
export type DreamType = 'nightmare' | 'recurring' | 'lucid' | 'normal';

/** 心理学派类型 - 表示 AI 分析梦境时采用的心理学流派 */
export type PsychologySchool = 'jung' | 'freud' | 'cognitive' | 'integrated' | 'zhougong';

/** 梦境接口 - 表示一条完整的梦境记录 */
export interface Dream {
  id: string;                    // 梦境唯一标识
  userId: string;                // 所属用户 ID
  title: string | null;          // 梦境标题，未设置时为 null
  content: string;               // 梦境内容描述（必填）
  emotions: string[];            // 梦中情绪标签列表（如 ["恐惧", "焦虑"]）
  clarity: Clarity | null;       // 梦境清晰度，未选择时为 null
  dreamType: DreamType | null;   // 梦境类型，未选择时为 null
  scenes: string[];              // 梦境场景标签列表（如 ["家", "追逐"]）
  aiSummary: string | null;      // AI 生成的梦境摘要，未分析时为 null
  anxietyScore: number | null;   // 焦虑评分（0-100），未分析时为 null
  recordedAt: string;            // 用户记录的梦境发生时间（ISO 8601）
  createdAt: string;             // 梦境记录创建时间（ISO 8601）
  sessions?: ChatSession[];      // 关联的 AI 分析会话列表
}

// ======================== 聊天相关类型 ========================

/** 聊天会话接口 - 表示一次 AI 梦境分析对话 */
export interface ChatSession {
  id: string;                                          // 会话唯一标识
  userId: string;                                      // 所属用户 ID
  dreamId: string | null;                              // 关联的梦境 ID，自由对话时为 null
  school: PsychologySchool;                            // 使用的心理学流派
  title: string | null;                                // 会话标题，未生成时为 null
  createdAt: string;                                   // 会话创建时间
  updatedAt: string;                                   // 会话最后更新时间
  messages?: Message[];                                // 会话中的消息列表
  dream?: { id: string; title: string | null } | null; // 关联梦境的摘要信息
}

/** 聊天消息接口 - 表示会话中的单条消息 */
export interface Message {
  id: string;                           // 消息唯一标识
  sessionId: string;                    // 所属会话 ID
  role: 'user' | 'assistant' | 'system'; // 消息角色：用户、AI 助手、系统提示
  content: string;                      // 消息文本内容
  createdAt: string;                    // 消息创建时间
}

// ======================== API 响应类型 ========================

/** 通用 API 响应接口 - 包装后端返回的数据或错误信息 */
export interface ApiResponse<T = any> {
  data?: T;        // 响应数据（请求成功时存在）
  error?: string;  // 错误信息（请求失败时存在）
}

/** 分页响应接口 - 用于列表数据的分页查询结果 */
export interface PaginatedResponse<T> {
  dreams: T[];      // 当前页的数据列表
  total: number;    // 数据总条数
  page: number;     // 当前页码（从 1 开始）
  totalPages: number; // 总页数
}

// ======================== 认证状态类型 ========================

/** 认证状态接口 - 表示当前用户的登录状态，用于全局 Context */
export interface AuthState {
  user: User | null;          // 当前登录用户信息，未登录时为 null
  token: string | null;       // JWT 认证令牌，未登录时为 null
  isAuthenticated: boolean;   // 是否已登录
  isLoading: boolean;         // 认证信息是否正在加载中（如刷新 token 时）
}

// ======================== 表单数据类型 ========================

/** 梦境表单数据接口 - 用于记录梦境页的表单提交 */
export interface DreamFormData {
  title?: string;             // 梦境标题（选填）
  content: string;            // 梦境内容描述（必填）
  emotions: string[];         // 情绪标签列表
  clarity?: Clarity;          // 梦境清晰度（选填）
  dreamType?: DreamType;      // 梦境类型（选填）
  scenes: string[];           // 场景标签列表
}

// ======================== 标签映射常量 ========================

/** 梦境清晰度标签映射 - 将英文枚举值映射为中文显示文本 */
export const CLARITY_LABELS: Record<Clarity, string> = {
  blurry: '模糊',
  normal: '一般',
  clear: '清晰',
  vivid: '非常清晰',
};

/** 梦境类型标签映射 - 将英文枚举值映射为中文显示文本 */
export const DREAM_TYPE_LABELS: Record<DreamType, string> = {
  nightmare: '噩梦',
  recurring: '反复出现',
  lucid: '清醒梦',
  normal: '普通梦',
};

/** 心理学派标签映射 - 将英文枚举值映射为中文显示名称 */
export const SCHOOL_LABELS: Record<PsychologySchool, string> = {
  jung: '荣格分析',
  freud: '弗洛伊德',
  cognitive: '认知心理',
  integrated: '综合分析',
  zhougong: '周公解梦',
};

/** 心理学派描述映射 - 每个学派的简要说明，用于选择时的提示 */
export const SCHOOL_DESCRIPTIONS: Record<PsychologySchool, string> = {
  jung: '原型意象与集体无意识',
  freud: '潜意识愿望与压抑分析',
  cognitive: '日间残留与认知模式',
  integrated: '融合多学派视角',
  zhougong: '中国传统梦境象征解读',
};

// ======================== 梦境标签选项常量 ========================

/** 情绪选项列表 - 用于记录梦境时的情绪标签选择 */
export const EMOTION_OPTIONS = [
  '恐惧', '焦虑', '愤怒', '悲伤', '困惑',
  '快乐', '兴奋', '平静', '好奇', '惊讶',
  '孤独', '温暖', '压力', '解脱', '迷茫',
];

/** 场景选项列表 - 用于记录梦境时的场景标签选择 */
export const SCENE_OPTIONS = [
  '家', '学校', '工作场所', '自然', '城市',
  '水', '高处', '黑暗', '飞行', '追逐',
  '考试', '迷路', '坠落', '遇见故人', '旅行',
];
