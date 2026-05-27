import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../UI/Button';
import { Input, Textarea } from '../UI/Input';
import { Tag } from '../UI/Tag';
import type { DreamFormData, Clarity, DreamType } from '../../types';
import { CLARITY_LABELS, DREAM_TYPE_LABELS, EMOTION_OPTIONS, SCENE_OPTIONS } from '../../types';

interface DreamFormProps {
  onSubmit: (data: DreamFormData) => Promise<void>;
  isLoading: boolean;
}

export function DreamForm({ onSubmit, isLoading }: DreamFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [clarity, setClarity] = useState<Clarity | undefined>();
  const [dreamType, setDreamType] = useState<DreamType | undefined>();
  const [scenes, setScenes] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const toggleEmotion = (emotion: string) => {
    setEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const toggleScene = (scene: string) => {
    setScenes((prev) =>
      prev.includes(scene) ? prev.filter((s) => s !== scene) : [...prev, scene]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title: title || undefined, content, emotions, clarity, dreamType, scenes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Input
        label="梦境标题（选填）"
        placeholder="给这个梦起个名字..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Content */}
      <Textarea
        label="梦境内容"
        placeholder="尽可能详细地描述你的梦境...&#10;&#10;你在哪？看到了什么？发生了什么？有什么感受？"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        required
      />

      {/* Emotions */}
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

      {/* Toggle more options */}
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

      {showMore && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          {/* Clarity */}
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

          {/* Dream type */}
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

          {/* Scenes */}
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

      {/* Submit */}
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
