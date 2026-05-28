import { create } from 'zustand';
import type { Dream, DreamFormData } from '../types';
import { createDream, getDreams, getDream, deleteDream, updateDream } from '../services/dreams';

interface DreamStore {
  dreams: Dream[];
  currentDream: Dream | null;
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;

  fetchDreams: (page?: number) => Promise<void>;
  fetchDream: (id: string) => Promise<void>;
  addDream: (data: DreamFormData) => Promise<Dream>;
  editDream: (id: string, data: Partial<DreamFormData>) => Promise<Dream>;
  removeDream: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useDreamStore = create<DreamStore>((set, get) => ({
  dreams: [],
  currentDream: null,
  isLoading: false,
  total: 0,
  page: 1,
  totalPages: 0,

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

  fetchDream: async (id: string) => {
    set({ isLoading: true });
    try {
      const dream = await getDream(id);
      set({ currentDream: dream, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addDream: async (data: DreamFormData) => {
    const dream = await createDream(data);
    set((state) => ({ dreams: [dream, ...state.dreams], total: state.total + 1 }));
    return dream;
  },

  editDream: async (id: string, data: Partial<DreamFormData>) => {
    const dream = await updateDream(id, data);
    set((state) => ({
      dreams: state.dreams.map((d) => (d.id === id ? dream : d)),
      currentDream: state.currentDream?.id === id ? dream : state.currentDream,
    }));
    return dream;
  },

  removeDream: async (id: string) => {
    await deleteDream(id);
    set((state) => ({
      dreams: state.dreams.filter((d) => d.id !== id),
      total: state.total - 1,
    }));
  },

  clearCurrent: () => set({ currentDream: null }),
}));
