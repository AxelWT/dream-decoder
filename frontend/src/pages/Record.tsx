/**
 * 记录梦境页（Record）
 *
 * 页面职责：提供梦境记录表单，用户可以输入梦境内容并保存。
 * 功能概述：
 *   - 展示记录小贴士，引导用户高效记录
 *   - 通过 DreamForm 组件收集梦境数据（标题、内容、情绪、场景等）
 *   - 保存成功后显示成功动画，1.5 秒后自动跳转到梦境详情页
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DreamForm } from '../components/Dream/DreamForm';
import { useDreamStore } from '../stores/dreamStore';
import type { DreamFormData } from '../types';

export function Record() {
  /** 提交加载状态 */
  const [isLoading, setIsLoading] = useState(false);
  /** 保存是否成功的标志 */
  const [success, setSuccess] = useState(false);
  const { addDream } = useDreamStore();
  const navigate = useNavigate();

  /**
   * 处理梦境表单提交
   * 保存成功后延迟 1.5 秒跳转到梦境详情页
   * @param data - 梦境表单数据
   */
  const handleSubmit = async (data: DreamFormData) => {
    setIsLoading(true);
    try {
      const dream = await addDream(data);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/dream/${dream.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to save dream:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 保存成功后的动画提示 */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">梦境已保存</h2>
            <p className="text-gray-400">正在跳转到梦境详情...</p>
          </motion.div>
        ) : (
          <>
            {/* 页面标题和描述 */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">记录梦境</h1>
              <p className="text-gray-400">
                趁记忆还鲜活，把梦里的故事写下来
              </p>
            </div>

            {/* 记录小贴士：引导用户高效记录梦境 */}
            <div className="glass-card p-4 mb-6 dream-gradient">
              <h3 className="text-sm font-medium text-white mb-2">记录小贴士</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 醒来后尽快记录，细节会随时间消退</li>
                <li>• 不必追求逻辑，如实描述梦中的画面和感受</li>
                <li>• 标注情绪和场景，帮助 AI 更好地解构</li>
              </ul>
            </div>

            {/* 梦境记录表单 */}
            <DreamForm onSubmit={handleSubmit} isLoading={isLoading} />
          </>
        )}
      </motion.div>
    </div>
  );
}
