import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { getPlans, createCheckout } from '../services/stripe';
import type { Plan } from '../types';

const planStyles: Record<string, { gradient: string; badge?: string }> = {
  FREE: { gradient: 'from-night-800 to-night-700' },
  PRO: { gradient: 'from-dream-purple/20 to-dream-blue/20', badge: '热门' },
  PREMIUM: { gradient: 'from-amber-500/20 to-orange-500/20', badge: '推荐' },
  LIFETIME: { gradient: 'from-emerald-500/20 to-teal-500/20' },
};

export function Pricing() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    getPlans().then(setPlans).catch(console.error);
  }, []);

  const handleUpgrade = async (plan: Plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (plan.id === 'FREE') return;

    try {
      setLoading(plan.id);
      const { url } = await createCheckout(plan.id);
      window.location.href = url;
    } catch (err: any) {
      alert(err.message || '创建支付会话失败');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-night-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">选择你的梦境探索计划</h1>
          <p className="text-gray-400">解锁更深层的梦境解读与无限 AI 解构</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const style = planStyles[plan.id] || planStyles.FREE;
            const isCurrent = user?.plan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border bg-gradient-to-b ${style.gradient} ${
                  isCurrent
                    ? 'border-dream-purple/50 ring-1 ring-dream-purple/30'
                    : 'border-night-700/50'
                } p-6 flex flex-col`}
              >
                {/* Badge */}
                {style.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-dream-purple text-xs font-medium text-white">
                    {style.badge}
                  </div>
                )}

                {/* Current indicator */}
                {isCurrent && (
                  <div className="absolute top-4 right-4 text-xs text-dream-purple font-medium">
                    当前
                  </div>
                )}

                {/* Plan info */}
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">
                    {plan.price === 0 ? '免费' : `¥${plan.price}`}
                  </span>
                  {plan.interval && (
                    <span className="text-sm text-gray-400">
                      /{plan.interval === 'month' ? '月' : plan.interval}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-dream-purple mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrent || loading === plan.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-night-700 text-gray-500 cursor-default'
                      : plan.id === 'FREE'
                      ? 'bg-night-700 text-gray-400 cursor-default'
                      : 'bg-dream-purple hover:bg-dream-purple/80 text-white glow-purple'
                  } disabled:opacity-50`}
                >
                  {loading === plan.id ? '跳转中...' : isCurrent ? '当前计划' : plan.id === 'FREE' ? '免费使用' : '立即升级'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
