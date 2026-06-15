/**
 * @file DreamForm.tsx
 * @description 梦境记录表单组件，用于新建梦境时输入梦境的标题、内容、情绪标签、
 *              清晰度、梦境类型和场景标签等信息。支持"更多细节"折叠展开。
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../UI/Button';
import { Input, Textarea } from '../UI/Input';
import { Tag } from '../UI/Tag';
import type { DreamFormData, Clarity, DreamType } from '../../types';
import { CLARITY_LABELS, DREAM_TYPE_LABELS, EMOTION_OPTIONS, SCENE_OPTIONS } from '../../types';

/** 梦境表单组件的 Props 定义 */
interface DreamFormProps {
  /** 表单提交回调，接收表单数据 */
  onSubmit: (data: DreamFormData) => Promise<void>;
  /** 是否正在提交中（控制按钮加载状态） */
  isLoading: boolean;
}

export function DreamForm({ onSubmit, isLoading }: DreamFormProps) {
  // 梦境标题（选填）
  const [title, setTitle] = useState('');
  // 梦境内容（必填，核心描述）
  const [content, setContent] = useState('');
  // 已选中的情绪标签列表
  const [emotions, setEmotions] = useState<string[]>([]);
  // 梦境清晰度（如：模糊、一般、清晰）
  const [clarity, setClarity] = useState<Clarity | undefined>();
  // 梦境类型（如：噩梦、清醒梦、日常梦等）
  const [dreamType, setDreamType] = useState<DreamType | undefined>();
  // 已选中的场景标签列表
  const [scenes, setScenes] = useState<string[]>([]);
  // 是否展开"更多细节"区域
  const [showMore, setShowMore] = useState(false);

  /** 切换情绪标签的选中/取消状态 */
  const toggleEmotion = (emotion: string) => {
    setEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  /** 切换场景标签的选中/取消状态 */
  const toggleScene = (scene: string) => {
    setScenes((prev) =>
      prev.includes(scene) ? prev.filter((s) => s !== scene) : [...prev, scene]
    );
  };

  /** 表单提交处理：阻止默认行为并调用父组件的 onSubmit 回调 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title: title || undefined, content, emotions, clarity, dreamType, scenes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 梦境标题输入框 */}
      <Input
        label="梦境标题（选填）"
        placeholder="给这个梦起个名字..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 梦境内容输入框（必填） */}
      <Textarea
        label="梦境内容"
        placeholder="尽可能详细地描述你的梦境...&#10;&#10;你在哪？看到了什么？发生了什么？有什么感受？"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        required
      />

      {/* 情绪标签选择区域 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">情绪标签</label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_OPTIONS.map((emotion) => (
            <Tag
              key={emotion}
              label={emotion}
              variant="emotion"
              selected={emotions.includes(emotion)}
              onClick={() => toggleEmotion(emotion)}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* 展开/收起"更多细节"按钮 */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showMore ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        更多细节（选填）
      </button>

      {/* 更多细节区域（带动画展开） */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          {/* 清晰度选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">梦境清晰度</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CLARITY_LABELS) as [Clarity, string][]).map(([value, label]) => (
                <Tag
                  key={value}
                  label={label}
                  selected={clarity === value}
                  onClick={() => setClarity(clarity === value ? undefined : value)}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* 梦境类型选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">梦境类型</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(DREAM_TYPE_LABELS) as [DreamType, string][]).map(([value, label]) => (
                <Tag
                  key={value}
                  label={label}
                  selected={dreamType === value}
                  onClick={() => setDreamType(dreamType === value ? undefined : value)}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* 场景标签选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">场景标签</label>
            <div className="flex flex-wrap gap-2">
              {SCENE_OPTIONS.map((scene) => (
                <Tag
                  key={scene}
                  label={scene}
                  variant="scene"
                  selected={scenes.includes(scene)}
                  onClick={() => toggleScene(scene)}
                  size="md"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 提交按钮，内容为空时禁用 */}
      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        size="lg"
        disabled={!content.trim()}
      >
        保存梦境
      </Button>
    </form>
  );
}
