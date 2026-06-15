/**
 * @file useAuth.ts
 * @description 认证 Hook，封装认证 Store 的常用操作，提供自动初始化和路由守卫功能。
 *              - 自动调用 initAuth 恢复登录状态
 *              - requireAuth 为 true 时（默认），未登录自动跳转到登录页
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * 认证 Hook
 * @param requireAuth - 是否要求登录，默认 true。设为 false 则不自动跳转登录页。
 * @returns 用户信息、认证状态、加载状态和退出方法
 */
export function useAuth(requireAuth = true) {
  const { user, isAuthenticated, isLoading, initAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  // 组件挂载时初始化认证（从 localStorage 恢复 token）
  useEffect(() => {
    initAuth();
  }, []);

  // 需要认证但未登录时，跳转到登录页
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, requireAuth, navigate]);

  return { user, isAuthenticated, isLoading, logout };
}
