/**
 * ForgotPasswordForm - 忘记密码/重置密码表单组件
 * 
 * 职责：
 * - 提供两步式密码重置流程：输入邮箱发送重置码 → 输入重置码和新密码完成重置
 * - 支持本地表单验证（密码一致性、密码长度）
 * - 支持返回登录页面
 * - 区分外部错误（服务端）和本地错误（客户端验证）
 */
import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

/** ForgotPasswordForm 组件的 Props 接口定义 */
interface ForgotPasswordFormProps {
  /** 发送重置码回调，接收邮箱参数 */
  onSendCode: (email: string) => Promise<void>;
  /** 重置密码回调，接收邮箱、重置码和新密码参数 */
  onReset: (email: string, code: string, newPassword: string) => Promise<void>;
  /** 返回登录页面的回调 */
  onBack: () => void;
  /** 是否正在加载中 */
  isLoading: boolean;
  /** 外部传入的错误信息（服务端返回） */
  error: string | null;
}

/** 重置流程的步骤类型：email 为输入邮箱步骤，reset 为重置密码步骤 */
type Step = 'email' | 'reset';

export function ForgotPasswordForm({ onSendCode, onReset, onBack, isLoading, error }: ForgotPasswordFormProps) {
  /** 当前步骤，默认为输入邮箱步骤 */
  const [step, setStep] = useState<Step>('email');
  /** 用户输入的邮箱地址 */
  const [email, setEmail] = useState('');
  /** 用户输入的重置码 */
  const [code, setCode] = useState('');
  /** 用户输入的新密码 */
  const [newPassword, setNewPassword] = useState('');
  /** 用户输入的确认新密码 */
  const [confirmPassword, setConfirmPassword] = useState('');
  /** 本地验证产生的错误信息（如密码不一致、长度不足等） */
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * 第一步：发送重置码表单提交处理
   * 清除本地错误，调用发送重置码回调，成功后切换到重置步骤
   */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    await onSendCode(email);
    setStep('reset');
  };

  /**
   * 第二步：重置密码表单提交处理
   * 先进行本地验证（密码一致性、最小长度），验证通过后调用重置回调
   */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    // 验证两次输入的密码是否一致
    if (newPassword !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }
    // 验证密码最小长度
    if (newPassword.length < 6) {
      setLocalError('密码至少6位');
      return;
    }
    await onReset(email, code, newPassword);
  };

  // 第一步：输入邮箱并发送重置码
  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} className="space-y-5">
        {/* 表单标题区域 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">忘记密码</h2>
          <p className="text-gray-400 mt-1">输入邮箱，我们将发送重置码</p>
        </div>

        {/* 优先显示外部错误，其次显示本地错误 */}
        {(error || localError) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
            {error || localError}
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

        {/* 发送重置码按钮 */}
        <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
          发送重置码
        </Button>

        {/* 返回登录页面的链接 */}
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

  // 第二步：输入重置码和新密码
  return (
    <form onSubmit={handleReset} className="space-y-5">
      {/* 表单标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">重置密码</h2>
        <p className="text-gray-400 mt-1">输入重置码和新密码</p>
      </div>

      {/* 优先显示外部错误，其次显示本地错误 */}
      {(error || localError) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error || localError}
        </div>
      )}

      {/* 重置码输入框 */}
      <Input
        label="重置码"
        placeholder="请输入6位重置码"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />

      {/* 新密码输入框 */}
      <Input
        label="新密码"
        type="password"
        placeholder="至少6位"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      {/* 确认新密码输入框 */}
      <Input
        label="确认新密码"
        type="password"
        placeholder="再次输入新密码"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {/* 重置密码提交按钮 */}
      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        重置密码
      </Button>

      {/* 底部操作链接 */}
      <div className="flex items-center justify-between text-sm">
        {/* 返回第一步重新发送重置码 */}
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          重新发送
        </button>
        {/* 返回登录页面 */}
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
