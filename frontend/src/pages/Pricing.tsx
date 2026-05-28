import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { getPlans, createOrder, getOrderStatus } from '../services/payjs';
import type { Plan } from '../types';

const planStyles: Record<string, { gradient: string; badge?: string }> = {
  FREE: { gradient: 'from-night-800 to-night-700' },
  PRO: { gradient: 'from-dream-purple/20 to-dream-blue/20', badge: '热门' },
  PREMIUM: { gradient: 'from-amber-500/20 to-orange-500/20', badge: '推荐' },
  LIFETIME: { gradient: 'from-emerald-500/20 to-teal-500/20' },
};

export function Pricing() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<'polling' | 'paid' | 'error' | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getPlans().then(setPlans).catch(console.error);
  }, []);

  // Poll for order status when modal is open
  useEffect(() => {
    if (!showModal || !currentOrderId || pollStatus !== 'polling') return;

    pollRef.current = setInterval(async () => {
      try {
        const result = await getOrderStatus(currentOrderId);
        if (result.status === 'paid') {
          setPollStatus('paid');
          if (pollRef.current) clearInterval(pollRef.current);
          await fetchUser();
          // Navigate to success page after a short delay
          setTimeout(() => {
            setShowModal(false);
            navigate(`/payment-success?order_id=${currentOrderId}`);
          }, 1500);
        }
      } catch {
        // Ignore polling errors, keep trying
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [showModal, currentOrderId, pollStatus, fetchUser, navigate]);

  const handleUpgrade = async (plan: Plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (plan.id === 'FREE') return;

    try {
      setLoading(plan.id);
      const { qrcode, orderId } = await createOrder(plan.id);
      setQrCode(qrcode);
      setCurrentOrderId(orderId);
      setCurrentPlan(plan.id);
      setPollStatus('polling');
      setShowModal(true);
    } catch (err: any) {
      alert(err.message || '创建支付订单失败');
    } finally {
      setLoading(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setQrCode(null);
    setCurrentOrderId(null);
    setCurrentPlan(null);
    setPollStatus(null);
    if (pollRef.current) clearInterval(pollRef.current);
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
                  {loading === plan.id ? '创建中...' : isCurrent ? '当前计划' : plan.id === 'FREE' ? '免费使用' : '立即升级'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment QR Code Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-night-800 rounded-2xl border border-night-600 p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {pollStatus === 'paid' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">支付成功</h3>
                  <p className="text-gray-400 text-sm">正在跳转...</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-2">微信扫码支付</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    请使用微信扫描下方二维码完成支付
                  </p>

                  {/* QR Code */}
                  {qrCode && (
                    <div className="bg-white rounded-xl p-4 inline-block mb-4">
                      <img src={qrCode} alt="支付二维码" className="w-48 h-48" />
                    </div>
                  )}

                  <p className="text-gray-500 text-xs mb-4">
                    支付完成后页面将自动跳转
                  </p>

                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    取消支付
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
