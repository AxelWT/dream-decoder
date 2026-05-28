import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { CodeLoginForm } from '../components/Auth/CodeLoginForm';
import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm';
import { useAuthStore } from '../stores/authStore';
import { loginWithPassword, registerUser, sendVerificationCode, verifyCode, sendResetCode, resetPassword } from '../services/auth';

type AuthMode = 'login' | 'register' | 'code' | 'forgot';

export function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginWithPassword(email, password);
      setAuth(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, nickname: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUser(email, password, nickname);
      setAuth(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendVerificationCode(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyCode(email, code);
      setAuth(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendResetCode(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email, code, newPassword);
      setMode('login');
      setError(null);
      alert('密码重置成功，请使用新密码登录');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dream-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dream-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-dream-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      </div>

      {/* Stars */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse-soft"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: Math.random() * 0.5 + 0.2,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-dream-purple to-dream-blue flex items-center justify-center glow-purple mb-4"
          >
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient">梦境解构师</h1>
          <p className="text-gray-500 mt-2">探索潜意识的奥秘</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          {mode === 'login' && (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => { setMode('register'); setError(null); }}
              onSwitchToCode={() => { setMode('code'); setError(null); }}
              onForgotPassword={() => { setMode('forgot'); setError(null); }}
              isLoading={isLoading}
              error={error}
            />
          )}
          {mode === 'register' && (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => { setMode('login'); setError(null); }}
              isLoading={isLoading}
              error={error}
            />
          )}
          {mode === 'code' && (
            <CodeLoginForm
              onSendCode={handleSendCode}
              onVerify={handleVerify}
              onSwitchToLogin={() => { setMode('login'); setError(null); }}
              isLoading={isLoading}
              error={error}
            />
          )}
          {mode === 'forgot' && (
            <ForgotPasswordForm
              onSendCode={handleSendResetCode}
              onReset={handleResetPassword}
              onBack={() => { setMode('login'); setError(null); }}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
