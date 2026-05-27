import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

interface CodeLoginFormProps {
  onSendCode: (email: string) => Promise<void>;
  onVerify: (email: string, code: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export function CodeLoginForm({ onSendCode, onVerify, onSwitchToLogin, isLoading, error }: CodeLoginFormProps) {
  const [email, setEmail] = useState('');
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(email, code);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">验证码登录</h2>
        <p className="text-gray-400 mt-1">输入邮箱获取验证码</p>
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
      />

      {!codeSent ? (
        <Button
          onClick={handleSendCode}
          isLoading={isLoading}
          className="w-full"
          size="lg"
          disabled={!email}
        >
          发送验证码
        </Button>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
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
            验证登录
          </Button>
        </form>
      )}

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-gray-400 hover:text-white transition-colors"
        >
          返回密码登录
        </button>
      </div>
    </div>
  );
}
