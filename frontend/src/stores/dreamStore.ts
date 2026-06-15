/**
 * @file dreamStore.ts
 * @description 梦境状态管理 Store，使用 Zustand 管理梦境列表和当前梦境的 CRUD 操作。
 *              支持分页加载、新建、编辑和删除梦境。
 */
import { create } from 'zustand';
import type { Dream, DreamFormData } from '../types';
import { createDream, getDreams, getDream, deleteDream, updateDream } from '../services/dreams';

/** 梦境 Store 的状态和操作接口 */
interface DreamStore {
  /** 梦境列表 */
  dreams: Dream[];
  /** 当前查看的梦境 */
  currentDream: Dream | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 梦境总数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 总页数 */
  totalPages: number;

  /** 获取梦境列表（分页） */
  fetchDreams: (page?: number) => Promise<void>;
  /** 获取单个梦境详情 */
  fetchDream: (id: string) => Promise<void>;
  /** 新建梦境 */
  addDream: (data: DreamFormData) => Promise<Dream>;
  /** 编辑梦境 */
  editDream: (id: string, data: Partial<DreamFormData>) => Promise<Dream>;
  /** 删除梦境 */
  removeDream: (id: string) => Promise<void>;
  /** 清除当前梦境 */
  clearCurrent: () => void;
}

export const useDreamStore = create<DreamStore>((set, get) => ({
  dreams: [],
  currentDream: null,
  isLoading: false,
  total: 0,
  page: 1,
  totalPages: 0,

  /** 获取梦境列表并更新分页信息 */
  fetchDreams: async (page = 1) => {
    set({ isLoading: true });
    try {
      const result = await getDreams(page);
      set({
        dreams: result.dreams,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 获取单个梦境详情 */
  fetchDream: async (id: string) => {
    set({ isLoading: true });
    try {
      const dream = await getDream(id);
      set({ currentDream: dream, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 新建梦境，添加到列表头部并更新总数 */
  addDream: async (data: DreamFormData) => {
    const dream = await createDream(data);
    set((state) => ({ dreams: [dream, ...state.dreams], total: state.total + 1 }));
    return dream;
  },

  /** 编辑梦境，同步更新列表和当前梦境 */
  editDream: async (id: string, data: Partial<DreamFormData>) => {
    const dream = await updateDream(id, data);
    set((state) => ({
      dreams: state.dreams.map((d) => (d.id === id ? dream : d)),
      currentDream: state.currentDream?.id === id ? dream : state.currentDream,
    }));
    return dream;
  },

  /** 删除梦境，从列表中移除并更新总数 */
  removeDream: async (id: string) => {
    await deleteDream(id);
    set((state) => ({
      dreams: state.dreams.filter((d) => d.id !== id),
      total: state.total - 1,
    }));
  },

  /** 清除当前梦境引用 */
  clearCurrent: () => set({ currentDream: null }),
}));
