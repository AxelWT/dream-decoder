/**
 * @file profileStore.ts
 * @description 用户档案状态管理 Store，使用 Zustand 管理用户档案信息和统计数据。
 *              支持档案获取、保存和统计查询。
 */
import { create } from 'zustand';
import type { Profile, ProfileStats } from '../types';
import { getProfile, updateProfile, getProfileStats } from '../services/profile';

/** 档案 Store 的状态和操作接口 */
interface ProfileStore {
  /** 用户档案数据 */
  profile: Profile | null;
  /** 用户统计数据 */
  stats: ProfileStats | null;
  /** 是否正在加载 */
  isLoading: boolean;

  /** 获取用户档案 */
  fetchProfile: () => Promise<void>;
  /** 保存/更新用户档案 */
  saveProfile: (data: Partial<Profile>) => Promise<void>;
  /** 获取用户统计数据 */
  fetchStats: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  stats: null,
  isLoading: false,

  /** 获取用户档案信息 */
  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { profile } = await getProfile();
      set({ profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 保存用户档案，成功后更新 Store 中的档案数据 */
  saveProfile: async (data: Partial<Profile>) => {
    const profile = await updateProfile(data);
    set({ profile });
  },

  /** 获取用户统计数据 */
  fetchStats: async () => {
    try {
      const stats = await getProfileStats();
      set({ stats });
    } catch {
      // ignore
    }
  },
}));
