import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function useAuth(requireAuth = true) {
  const { user, isAuthenticated, isLoading, initAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, requireAuth, navigate]);

  return { user, isAuthenticated, isLoading, logout };
}
