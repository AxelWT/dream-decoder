// User types
export interface User {
  id: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  createdAt?: string;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  ageRange: string | null;
  gender: string | null;
  occupation: string | null;
  stressLevel: number | null;
  concerns: string[];
  preferredSchool: string | null;
}

// Dream types
export type Clarity = 'blurry' | 'normal' | 'clear' | 'vivid';
export type DreamType = 'nightmare' | 'recurring' | 'lucid' | 'normal';
export type PsychologySchool = 'jung' | 'freud' | 'cognitive' | 'integrated';

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
};

export const SCHOOL_DESCRIPTIONS: Record<PsychologySchool, string> = {
  jung: '原型意象与集体无意识',
  freud: '潜意识愿望与压抑分析',
  cognitive: '日间残留与认知模式',
  integrated: '融合多学派视角',
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
