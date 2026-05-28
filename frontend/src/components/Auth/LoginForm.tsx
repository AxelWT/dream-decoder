import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  onSwitchToCode: () => void;
  onForgotPassword: () => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, onSwitchToRegister, onSwitchToCode, onForgotPassword, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">欢迎回来</h2>
        <p className="text-gray-400 mt-1">登录以继续探索你的梦境</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="邮箱"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label="密码"
        type="password"
        placeholder="输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        登录
      </Button>

      <div className="flex items-center justify-between text-sm">
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
