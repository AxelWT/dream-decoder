import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh user data to get updated plan/credits
    fetchUser();

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
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">支付成功</h1>
        <p className="text-gray-400 mb-6">
          感谢你的订阅！你的账户已升级，现在可以享受更多功能。
        </p>

        <p className="text-sm text-gray-500">
          {countdown} 秒后自动跳转到首页...
        </p>

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
