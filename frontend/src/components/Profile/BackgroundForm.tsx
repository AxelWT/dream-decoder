/**
 * @file BackgroundForm.tsx
 * @description 用户背景档案表单组件，用于收集和完善用户的个人信息、心理状态、
 *              性格倾向、梦境习惯和偏好设置，以便提供个性化的梦境解读。
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from '../../stores/profileStore';
import type { Profile } from '../../types';
import {
  AGE_RANGE_OPTIONS,
  GENDER_OPTIONS,
  MBTI_OPTIONS,
  DREAM_FREQUENCY_OPTIONS,
  PSYCH_KNOWLEDGE_OPTIONS,
  CONCERN_OPTIONS,
  LIFE_CHANGE_OPTIONS,
  SCHOOL_LABELS,
} from '../../types';
import type { PsychologySchool } from '../../types';

export function BackgroundForm() {
  const { profile, saveProfile, isLoading } = useProfileStore();
  // 是否正在保存中
  const [saving, setSaving] = useState(false);
  // 是否刚保存成功（用于显示成功提示）
  const [saved, setSaved] = useState(false);

  // 表单数据状态
  const [form, setForm] = useState({
    ageRange: '',         // 年龄段
    gender: '',           // 性别
    occupation: '',       // 职业领域
    stressLevel: 5,       // 压力水平（1-10）
    concerns: [] as string[],   // 主要困扰（多选）
    lifeChanges: [] as string[], // 正在经历的变化（多选）
    mbti: '',             // MBTI 类型
    dreamFrequency: '',   // 记梦频率
    lucidDreamExp: false, // 是否有过清醒梦经验
    psychKnowledge: '',   // 心理学了解程度
    preferredSchool: '',  // 偏好的心理学派
  });

  // 当 profile 加载完成后，用已有数据填充表单
  useEffect(() => {
    if (profile) {
      setForm({
        ageRange: profile.ageRange || '',
        gender: profile.gender || '',
        occupation: profile.occupation || '',
        stressLevel: profile.stressLevel || 5,
        concerns: profile.concerns || [],
        lifeChanges: profile.lifeChanges || [],
        mbti: profile.mbti || '',
        dreamFrequency: profile.dreamFrequency || '',
        lucidDreamExp: profile.lucidDreamExp || false,
        psychKnowledge: profile.psychKnowledge || '',
        preferredSchool: profile.preferredSchool || '',
      });
    }
  }, [profile]);

  /** 切换多选字段（concerns / lifeChanges）中的选项 */
  const toggleArrayItem = (field: 'concerns' | 'lifeChanges', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  /** 表单提交处理：保存用户档案，成功后显示3秒提示 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile({
        ...form,
        ageRange: form.ageRange || undefined,
        gender: form.gender || undefined,
        occupation: form.occupation || undefined,
        mbti: form.mbti || undefined,
        dreamFrequency: form.dreamFrequency || undefined,
        psychKnowledge: form.psychKnowledge || undefined,
        preferredSchool: form.preferredSchool || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error handled by store
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本信息区块 */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">基本信息</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 年龄段选择 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">年龄段</label>
            <select
              value={form.ageRange}
              onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
              className="w-full bg-night-900 border border-night-700 rounded-xl px-4 py-2.5 text-white focus:border-dream-purple focus:outline-none"
            >
              <option value="">请选择</option>
              {AGE_RANGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* 性别选择 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">性别</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full bg-night-900 border border-night-700 rounded-xl px-4 py-2.5 text-white focus:border-dream-purple focus:outline-none"
            >
              <option value="">请选择</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* 职业领域输入 */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">职业领域</label>
            <input
              type="text"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              placeholder="如：互联网、教育、医疗..."
              className="w-full bg-night-900 border border-night-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-dream-purple focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 心理状态区块 */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">心理状态</h3>
        <div className="space-y-4">
          {/* 压力水平滑块 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              压力水平：<span className="text-dream-purple font-medium">{form.stressLevel}/10</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={form.stressLevel}
              onChange={(e) => setForm({ ...form, stressLevel: Number(e.target.value) })}
              className="w-full accent-dream-purple"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>轻松</span>
              <span>压力很大</span>
            </div>
          </div>
          {/* 主要困扰多选 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">主要困扰（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {CONCERN_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArrayItem('concerns', opt)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    form.concerns.includes(opt)
                      ? 'bg-dream-purple/20 text-dream-purple border border-dream-purple/30'
                      : 'bg-night-900 text-gray-400 border border-night-700 hover:border-gray-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {/* 正在经历的变化多选 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">正在经历的变化（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {LIFE_CHANGE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArrayItem('lifeChanges', opt)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    form.lifeChanges.includes(opt)
                      ? 'bg-dream-blue/20 text-dream-blue border border-dream-blue/30'
                      : 'bg-night-900 text-gray-400 border border-night-700 hover:border-gray-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 性格倾向区块 */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">性格倾向</h3>
        <div>
          {/* MBTI 类型选择 */}
          <label className="block text-sm text-gray-400 mb-1">MBTI 类型（可选）</label>
          <select
            value={form.mbti}
            onChange={(e) => setForm({ ...form, mbti: e.target.value })}
            className="w-full bg-night-900 border border-night-700 rounded-xl px-4 py-2.5 text-white focus:border-dream-purple focus:outline-none"
          >
            <option value="">不确定 / 不想透露</option>
            {MBTI_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </section>

      {/* 梦境习惯区块 */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">梦境习惯</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 记梦频率选择 */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">记梦频率</label>
              <select
                value={form.dreamFrequency}
                onChange={(e) => setForm({ ...form, dreamFrequency: e.target.value })}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-4 py-2.5 text-white focus:border-dream-purple focus:outline-none"
              >
                <option value="">请选择</option>
                {DREAM_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* 心理学了解程度选择 */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">心理学了解程度</label>
              <select
                value={form.psychKnowledge}
                onChange={(e) => setForm({ ...form, psychKnowledge: e.target.value })}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-4 py-2.5 text-white focus:border-dream-purple focus:outline-none"
              >
                <option value="">请选择</option>
                {PSYCH_KNOWLEDGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* 清醒梦经验勾选 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.lucidDreamExp}
              onChange={(e) => setForm({ ...form, lucidDreamExp: e.target.checked })}
              className="w-4 h-4 accent-dream-purple rounded"
            />
            <span className="text-sm text-gray-300">我有过清醒梦（在梦中意识到自己在做梦）的经验</span>
          </label>
        </div>
      </section>

      {/* 偏好设置区块 */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">偏好设置</h3>
        <div>
          {/* 偏好的心理学派选择 */}
          <label className="block text-sm text-gray-400 mb-1">偏好的心理学派</label>
          <select
            value={form.preferredSchool}
            onChange={(e) => setForm({ ...form, preferredSchool: e.target.value })}
            className="w-full bg-night-900 border border-night-700 rounded-xl px-4 py-2.5 text-white focus:border-dream-purple focus:outline-none"
          >
            <option value="">不指定（使用综合分析）</option>
            {(Object.entries(SCHOOL_LABELS) as [PsychologySchool, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* 提交按钮和成功提示 */}
      <div className="flex items-center gap-4">
        <motion.button
          type="submit"
          disabled={saving || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 bg-gradient-to-r from-dream-purple to-dream-blue text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存档案'}
        </motion.button>
        {/* 保存成功提示（3秒后消失） */}
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-400 text-sm"
          >
            保存成功
          </motion.span>
        )}
      </div>
    </form>
  );
}
