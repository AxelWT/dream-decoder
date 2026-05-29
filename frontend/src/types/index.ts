// User types
export interface User {
  id: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  credits: number;
  plan: string;
  createdAt?: string;
  profile?: Profile | null;
}

// Plan types
export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  priceId?: string;
  features: string[];
}

export interface Profile {
  id: string;
  userId: string;
  ageRange: string | null;
  gender: string | null;
  occupation: string | null;
  stressLevel: number | null;
  concerns: string[];
  lifeChanges: string[];
  mbti: string | null;
  dreamFrequency: string | null;
  lucidDreamExp: boolean;
  psychKnowledge: string | null;
  preferredSchool: string | null;
}

export interface ProfileStats {
  totalDreams: number;
  monthlyDreams: number;
  topEmotions: { emotion: string; count: number }[];
}

export const AGE_RANGE_OPTIONS = [
  '18岁以下', '18-24', '25-34', '35-44', '45-54', '55-64', '65岁以上',
];

export const GENDER_OPTIONS = [
  '男', '女', '非二元', '不愿透露',
];

export const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export const DREAM_FREQUENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周几次' },
  { value: 'monthly', label: '每月几次' },
  { value: 'rare', label: '很少记起' },
];

export const PSYCH_KNOWLEDGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: '完全不了解' },
  { value: 'basic', label: '略有耳闻' },
  { value: 'intermediate', label: '有一定了解' },
  { value: 'advanced', label: '较为熟悉' },
];

export const CONCERN_OPTIONS = [
  '工作压力', '人际关系', '情感关系', '家庭问题', '学业压力',
  '健康问题', '经济压力', '自我认同', '未来迷茫', '睡眠质量',
];

export const LIFE_CHANGE_OPTIONS = [
  '换工作', '搬家', '恋爱/结婚', '分手/离婚', '亲人离世',
  '升学', '创业', '退休', '生育', '健康变化',
];

// Dream types
export type Clarity = 'blurry' | 'normal' | 'clear' | 'vivid';
export type DreamType = 'nightmare' | 'recurring' | 'lucid' | 'normal';
export type PsychologySchool = 'jung' | 'freud' | 'cognitive' | 'integrated' | 'zhougong';

export interface Dream {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  emotions: string[];
  clarity: Clarity | null;
  dreamType: DreamType | null;
  scenes: string[];
  aiSummary: string | null;
  anxietyScore: number | null;
  recordedAt: string;
  createdAt: string;
  sessions?: ChatSession[];
}

// Chat types
export interface ChatSession {
  id: string;
  userId: string;
  dreamId: string | null;
  school: PsychologySchool;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  dream?: { id: string; title: string | null } | null;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

// API types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  dreams: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Form types
export interface DreamFormData {
  title?: string;
  content: string;
  emotions: string[];
  clarity?: Clarity;
  dreamType?: DreamType;
  scenes: string[];
}

// Label maps
export const CLARITY_LABELS: Record<Clarity, string> = {
  blurry: '模糊',
  normal: '一般',
  clear: '清晰',
  vivid: '非常清晰',
};

export const DREAM_TYPE_LABELS: Record<DreamType, string> = {
  nightmare: '噩梦',
  recurring: '反复出现',
  lucid: '清醒梦',
  normal: '普通梦',
};

export const SCHOOL_LABELS: Record<PsychologySchool, string> = {
  jung: '荣格分析',
  freud: '弗洛伊德',
  cognitive: '认知心理',
  integrated: '综合分析',
  zhougong: '周公解梦',
};

export const SCHOOL_DESCRIPTIONS: Record<PsychologySchool, string> = {
  jung: '原型意象与集体无意识',
  freud: '潜意识愿望与压抑分析',
  cognitive: '日间残留与认知模式',
  integrated: '融合多学派视角',
  zhougong: '中国传统梦境象征解读',
};

export const EMOTION_OPTIONS = [
  '恐惧', '焦虑', '愤怒', '悲伤', '困惑',
  '快乐', '兴奋', '平静', '好奇', '惊讶',
  '孤独', '温暖', '压力', '解脱', '迷茫',
];

export const SCENE_OPTIONS = [
  '家', '学校', '工作场所', '自然', '城市',
  '水', '高处', '黑暗', '飞行', '追逐',
  '考试', '迷路', '坠落', '遇见故人', '旅行',
];
