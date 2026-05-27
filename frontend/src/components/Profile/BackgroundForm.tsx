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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    ageRange: '',
    gender: '',
    occupation: '',
    stressLevel: 5,
    concerns: [] as string[],
    lifeChanges: [] as string[],
    mbti: '',
    dreamFrequency: '',
    lucidDreamExp: false,
    psychKnowledge: '',
    preferredSchool: '',
  });

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

  const toggleArrayItem = (field: 'concerns' | 'lifeChanges', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

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
      {/* Basic Info */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">基本信息</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Mental State */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">心理状态</h3>
        <div className="space-y-4">
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

      {/* Personality */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">性格倾向</h3>
        <div>
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

      {/* Dream Habits */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">梦境习惯</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Preferences */}
      <section className="bg-night-800/50 rounded-2xl p-6 border border-night-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">偏好设置</h3>
        <div>
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

      {/* Submit */}
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
