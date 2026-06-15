/**
 * 支付成功页（PaymentSuccess）
 *
 * 页面职责：在用户完成支付后展示成功提示，并自动倒计时跳转回首页。
 * 功能概述：
 *   - 展示支付成功动画和提示文案
 *   - 刷新用户信息以获取最新订阅状态
 *   - 5 秒倒计时自动跳转首页
 *   - 提供"立即返回"按钮手动跳转
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  /** 倒计时秒数 */
  const [countdown, setCountdown] = useState(5);

  /* 支付成功后刷新用户信息并启动倒计时跳转 */
  useEffect(() => {
    /* 刷新用户数据以获取更新后的订阅计划和额度 */
    fetchUser();

    /* 每秒倒计时，归零后自动跳转首页 */
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchUser, navigate]);

  return (
    <div className="min-h-screen bg-night-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* 成功图标 */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* 成功文案 */}
        <h1 className="text-2xl font-bold text-white mb-2">支付成功</h1>
        <p className="text-gray-400 mb-6">
          感谢你的订阅！你的账户已升级，现在可以享受更多功能。
        </p>

        {/* 倒计时提示 */}
        <p className="text-sm text-gray-500">
          {countdown} 秒后自动跳转到首页...
        </p>

        {/* 手动返回按钮 */}
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-dream-purple hover:bg-dream-purple/80 text-white rounded-xl text-sm font-medium transition-colors"
        >
          立即返回
        </button>
      </motion.div>
    </div>
  );
}
