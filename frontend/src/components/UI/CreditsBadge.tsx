import { useAuthStore } from '../../stores/authStore';

export function CreditsBadge() {
  const { user } = useAuthStore();

  if (!user) return null;

  const isUnlimited = ['PRO', 'PREMIUM', 'LIFETIME'].includes(user.plan);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-night-800 border border-night-700/50">
      <svg className="w-4 h-4 text-dream-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {isUnlimited ? (
        <span className="text-xs font-medium text-dream-purple">无限</span>
      ) : (
        <span className="text-xs font-medium text-gray-300">
          {user.credits} <span className="text-gray-500">次</span>
        </span>
      )}
    </div>
  );
}
