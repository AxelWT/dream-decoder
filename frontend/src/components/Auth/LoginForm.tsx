/**
 * LoginForm - 邮箱密码登录表单组件
 * 
 * 职责：
 * - 提供邮箱 + 密码的传统登录方式
 * - 支持切换到验证码登录、注册页面和忘记密码页面
 * - 显示外部传入的错误信息和加载状态
 */
import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

/** LoginForm 组件的 Props 接口定义 */
interface LoginFormProps {
  /** 登录回调，接收邮箱和密码参数 */
  onLogin: (email: string, password: string) => Promise<void>;
  /** 切换到注册页面的回调 */
  onSwitchToRegister: () => void;
  /** 切换到验证码登录页面的回调 */
  onSwitchToCode: () => void;
  /** 切换到忘记密码页面的回调 */
  onForgotPassword: () => void;
  /** 是否正在加载中（请求进行中） */
  isLoading: boolean;
  /** 外部传入的错误信息 */
  error: string | null;
}

export function LoginForm({ onLogin, onSwitchToRegister, onSwitchToCode, onForgotPassword, isLoading, error }: LoginFormProps) {
  /** 用户输入的邮箱地址 */
  const [email, setEmail] = useState('');
  /** 用户输入的密码 */
  const [password, setPassword] = useState('');

  /**
   * 表单提交事件处理
   * 阻止默认行为，调用登录回调
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 表单标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">欢迎回来</h2>
        <p className="text-gray-400 mt-1">登录以继续探索你的梦境</p>
      </div>

      {/* 错误信息提示，仅在 error 存在时显示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 邮箱输入框 */}
      <Input
        label="邮箱"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* 密码输入框 */}
      <Input
        label="密码"
        type="password"
        placeholder="输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* 登录提交按钮 */}
      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        登录
      </Button>

      {/* 底部操作链接区域 */}
      <div className="flex items-center justify-between text-sm">
        {/* 左侧：切换验证码登录 + 忘记密码 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSwitchToCode}
            className="text-dream-purple hover:text-dream-purple/80 transition-colors"
          >
            验证码登录
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            忘记密码？
          </button>
        </div>
        {/* 右侧：切换到注册页面 */}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-gray-400 hover:text-white transition-colors"
        >
          没有账号？注册
        </button>
      </div>
    </form>
  );
}
