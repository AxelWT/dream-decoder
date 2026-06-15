/**
 * @file CreditsBadge.tsx
 * @description 用户积分/额度徽章组件，显示当前用户的可用次数。
 *              PRO/PREMIUM/LIFETIME 套餐显示"无限"，其他套餐显示剩余次数。
 */
import { useAuthStore } from '../../stores/authStore';

export function CreditsBadge() {
  const { user } = useAuthStore();

  // 未登录时不渲染
  if (!user) return null;

  // 判断是否为无限额度套餐
  const isUnlimited = ['PRO', 'PREMIUM', 'LIFETIME'].includes(user.plan);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-night-800 border border-night-700/50">
      {/* 闪电图标 */}
      <svg className="w-4 h-4 text-dream-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {isUnlimited ? (
        // 无限套餐显示"无限"标签
        <span className="text-xs font-medium text-dream-purple">无限</span>
      ) : (
        // 普通套餐显示剩余次数
        <span className="text-xs font-medium text-gray-300">
          {user.credits} <span className="text-gray-500">次</span>
        </span>
      )}
    </div>
  );
}
