/**
 * 登录页（Login）
 *
 * 页面职责：提供用户身份认证入口，包括密码登录、验证码登录、注册和忘记密码四种模式。
 * 功能概述：
 *   - 密码登录（默认模式）
 *   - 验证码快捷登录
 *   - 新用户注册（需邮箱验证码）
 *   - 忘记密码 / 重置密码
 *   - 已登录用户自动跳转首页
 *   - 星空背景 + 品牌动画展示
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { CodeLoginForm } from '../components/Auth/CodeLoginForm';
import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm';
import { useAuthStore } from '../stores/authStore';
import { loginWithPassword, registerUser, sendVerificationCode, verifyCode, sendResetCode, resetPassword } from '../services/auth';

/** 认证模式类型：登录、注册、验证码登录、忘记密码 */
type AuthMode = 'login' | 'register' | 'code' | 'forgot';

export function Login() {
  /** 当前认证模式，默认为密码登录 */
  const [mode, setMode] = useState<AuthMode>('login');
  /** 请求加载状态 */
  const [isLoading, setIsLoading] = useState(false);
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, initAuth } = useAuthStore();

  /* 初始化认证状态（检查本地存储的 token） */
  useEffect(() => {
    initAuth();
  }, []);

  /* 已登录时自动跳转首页 */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * 处理密码登录
   * @param email - 用户邮箱
   * @param password - 用户密码
   */
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

  /**
   * 处理用户注册
   * @param email - 邮箱
   * @param password - 密码
   * @param nickname - 昵称
   * @param code - 邮箱验证码
   */
  const handleRegister = async (email: string, password: string, nickname: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUser(email, password, nickname, code);
      setAuth(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 发送注册验证码
   * @param email - 接收验证码的邮箱
   */
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

  /**
   * 处理验证码登录
   * @param email - 邮箱
   * @param code - 验证码
   */
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

  /**
   * 发送密码重置验证码
   * @param email - 接收重置验证码的邮箱
   */
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

  /**
   * 处理密码重置
   * @param email - 邮箱
   * @param code - 验证码
   * @param newPassword - 新密码
   */
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
      {/* 背景装饰：渐变光晕动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dream-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dream-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-dream-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      </div>

      {/* 星星粒子效果：随机分布的闪烁光点 */}
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
        {/* Logo 和品牌标识区域 */}
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

        {/* 表单卡片区域：根据当前模式渲染不同的认证表单 */}
        <div className="glass-card p-8">
          {/* 密码登录表单 */}
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
          {/* 注册表单 */}
          {mode === 'register' && (
            <RegisterForm
              onRegister={handleRegister}
              onSendCode={handleSendCode}
              onSwitchToLogin={() => { setMode('login'); setError(null); }}
              isLoading={isLoading}
              error={error}
            />
          )}
          {/* 验证码登录表单 */}
          {mode === 'code' && (
            <CodeLoginForm
              onSendCode={handleSendCode}
              onVerify={handleVerify}
              onSwitchToLogin={() => { setMode('login'); setError(null); }}
              isLoading={isLoading}
              error={error}
            />
          )}
          {/* 忘记密码 / 重置密码表单 */}
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
