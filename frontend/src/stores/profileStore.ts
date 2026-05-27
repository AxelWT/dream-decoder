import { create } from 'zustand';
import type { Profile, ProfileStats } from '../types';
import { getProfile, updateProfile, getProfileStats } from '../services/profile';

interface ProfileStore {
  profile: Profile | null;
  stats: ProfileStats | null;
  isLoading: boolean;

  fetchProfile: () => Promise<void>;
  saveProfile: (data: Partial<Profile>) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  stats: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { profile } = await getProfile();
      set({ profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  saveProfile: async (data: Partial<Profile>) => {
    const profile = await updateProfile(data);
    set({ profile });
  },

  fetchStats: async () => {
    try {
      const stats = await getProfileStats();
      set({ stats });
    } catch {
      // ignore
    }
  },
}));
