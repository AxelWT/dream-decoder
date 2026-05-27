import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token: string, user: User) => {
        api.setToken(token);
        set({ token, user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        api.setToken(null);
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },

      fetchUser: async () => {
        try {
          const user = await getCurrentUser();
          set({ user });
        } catch {
          get().logout();
        }
      },

      initAuth: async () => {
        const { token } = get();
        if (token) {
          api.setToken(token);
          try {
            const user = await getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
          } catch {
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'dream-decoder-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
