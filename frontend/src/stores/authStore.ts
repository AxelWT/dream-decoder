/**
 * @file authStore.ts
 * @description 认证状态管理 Store，使用 Zustand + persist 中间件。
 *              管理用户登录状态、token 持久化和自动初始化认证。
 *              token 持久化到 localStorage，页面刷新后自动恢复登录状态。
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';

/** 认证 Store 的状态和操作接口 */
interface AuthStore {
  /** 当前登录用户信息 */
  user: User | null;
  /** JWT token */
  token: string | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在加载（初始化时为 true） */
  isLoading: boolean;

  /** 设置认证信息（登录成功后调用） */
  setAuth: (token: string, user: User) => void;
  /** 退出登录 */
  logout: () => void;
  /** 重新获取当前用户信息 */
  fetchUser: () => Promise<void>;
  /** 初始化认证（从 localStorage 恢复 token 并验证） */
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // 初始为 true，等待 initAuth 完成

      /** 设置认证信息：保存 token 到 API 客户端和 Store */
      setAuth: (token: string, user: User) => {
        api.setToken(token);
        set({ token, user, isAuthenticated: true, isLoading: false });
      },

      /** 退出登录：清除 token 和用户信息 */
      logout: () => {
        api.setToken(null);
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },

      /** 重新获取用户信息，失败时自动退出登录 */
      fetchUser: async () => {
        try {
          const user = await getCurrentUser();
          set({ user });
        } catch {
          get().logout();
        }
      },

      /** 初始化认证：检查是否有持久化的 token，有则验证有效性 */
      initAuth: async () => {
        const { token } = get();
        if (token) {
          // 有 token，设置到 API 客户端并验证
          api.setToken(token);
          try {
            const user = await getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
          } catch {
            // token 无效，清除认证状态
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          // 无 token，结束加载状态
          set({ isLoading: false });
        }
      },
    }),
    {
      // 持久化配置：仅持久化 token 到 localStorage
      name: 'dream-decoder-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
