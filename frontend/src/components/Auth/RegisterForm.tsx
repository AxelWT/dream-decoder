/**
 * RegisterForm - 用户注册表单组件
 * 
 * 职责：
 * - 提供邮箱 + 密码 + 昵称 + 验证码的注册流程
 * - 先填写基本信息后发送验证码，再输入验证码完成注册
 * - 验证码发送后启动 60 秒倒计时防止频繁重发
 * - 支持切换回登录页面
 */
import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

/** RegisterForm 组件的 Props 接口定义 */
interface RegisterFormProps {
  /** 注册回调，接收邮箱、密码、昵称和验证码参数 */
  onRegister: (email: string, password: string, nickname: string, code: string) => Promise<void>;
  /** 发送验证码回调，接收邮箱参数 */
  onSendCode: (email: string) => Promise<void>;
  /** 切换回登录页面的回调 */
  onSwitchToLogin: () => void;
  /** 是否正在加载中 */
  isLoading: boolean;
  /** 外部传入的错误信息 */
  error: string | null;
}

export function RegisterForm({ onRegister, onSendCode, onSwitchToLogin, isLoading, error }: RegisterFormProps) {
  /** 用户输入的邮箱地址 */
  const [email, setEmail] = useState('');
  /** 用户输入的密码 */
  const [password, setPassword] = useState('');
  /** 用户输入的昵称 */
  const [nickname, setNickname] = useState('');
  /** 用户输入的邮箱验证码 */
  const [code, setCode] = useState('');
  /** 验证码是否已发送，控制表单显示的阶段 */
  const [codeSent, setCodeSent] = useState(false);
  /** 验证码重发倒计时（秒），0 表示可以重新发送 */
  const [countdown, setCountdown] = useState(0);

  /**
   * 发送验证码处理函数
   * 调用外部发送验证码回调，成功后标记已发送并启动 60 秒倒计时
   */
  const handleSendCode = async () => {
    await onSendCode(email);
    setCodeSent(true);
    setCountdown(60);
    // 每秒递减倒计时，到 0 时清除定时器
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

  /**
   * 注册表单提交事件处理
   * 阻止默认行为，调用注册回调提交所有表单数据
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(email, password, nickname, code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 表单标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">创建账号</h2>
        <p className="text-gray-400 mt-1">开始记录和解构你的梦境</p>
      </div>

      {/* 错误信息提示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 昵称输入框 */}
      <Input
        label="昵称"
        type="text"
        placeholder="给自己起个名字"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />

      {/* 邮箱输入框 */}
      <Input
        label="邮箱"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* 密码输入框，最少 6 位 */}
      <Input
        label="密码"
        type="password"
        placeholder="至少6位"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />

      {/* 验证码未发送时：显示发送验证码按钮 */}
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
        /* 验证码已发送时：显示验证码输入框 + 注册按钮 */
        <>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">验证码</label>
            <div className="flex gap-2">
              {/* 验证码输入框 */}
              <Input
                type="text"
                placeholder="6位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="flex-1"
              />
              {/* 重新发送按钮，倒计时期间禁用 */}
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
          {/* 注册提交按钮 */}
          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            注册
          </Button>
        </>
      )}

      {/* 底部切换到登录页面的链接 */}
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
