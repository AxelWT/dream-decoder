import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

interface ForgotPasswordFormProps {
  onSendCode: (email: string) => Promise<void>;
  onReset: (email: string, code: string, newPassword: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

type Step = 'email' | 'reset';

export function ForgotPasswordForm({ onSendCode, onReset, onBack, isLoading, error }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    await onSendCode(email);
    setStep('reset');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (newPassword !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('密码至少6位');
      return;
    }
    await onReset(email, code, newPassword);
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">忘记密码</h2>
          <p className="text-gray-400 mt-1">输入邮箱，我们将发送重置码</p>
        </div>

        {(error || localError) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
            {error || localError}
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

        <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
          发送重置码
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            返回登录
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">重置密码</h2>
        <p className="text-gray-400 mt-1">输入重置码和新密码</p>
      </div>

      {(error || localError) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error || localError}
        </div>
      )}

      <Input
        label="重置码"
        placeholder="请输入6位重置码"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />

      <Input
        label="新密码"
        type="password"
        placeholder="至少6位"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <Input
        label="确认新密码"
        type="password"
        placeholder="再次输入新密码"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        重置密码
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          重新发送
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          返回登录
        </button>
      </div>
    </form>
  );
}
