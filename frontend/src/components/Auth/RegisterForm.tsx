import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

interface RegisterFormProps {
  onRegister: (email: string, password: string, nickname: string, code: string) => Promise<void>;
  onSendCode: (email: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export function RegisterForm({ onRegister, onSendCode, onSwitchToLogin, isLoading, error }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    await onSendCode(email);
    setCodeSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(email, password, nickname, code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">创建账号</h2>
        <p className="text-gray-400 mt-1">开始记录和解构你的梦境</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="昵称"
        type="text"
        placeholder="给自己起个名字"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />

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
        placeholder="至少6位"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />

      {!codeSent ? (
        <Button
          type="button"
          onClick={handleSendCode}
          isLoading={isLoading}
          className="w-full"
          size="lg"
          disabled={!email || !password || password.length < 6}
        >
          发送验证码
        </Button>
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">验证码</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="6位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSendCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}s` : '重新发送'}
              </Button>
            </div>
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            注册
          </Button>
        </>
      )}

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-gray-400 hover:text-white transition-colors"
        >
          已有账号？登录
        </button>
      </div>
    </form>
  );
}
