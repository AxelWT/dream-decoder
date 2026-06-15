/**
 * @file DreamDetail.tsx
 * @description 梦境详情页面组件，展示单个梦境的完整信息，支持编辑、删除、AI 解构、
 *              生成梦境卡片等功能。包含编辑模式切换和卡片生成器的交互逻辑。
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Tag } from '../UI/Tag';
import { Input, Textarea } from '../UI/Input';
import { CardGenerator } from '../VisualCard/CardGenerator';
import { DreamCardVisual } from '../VisualCard/DreamCardVisual';
import { useDreamStore } from '../../stores/dreamStore';
import { CLARITY_LABELS, DREAM_TYPE_LABELS, EMOTION_OPTIONS, SCENE_OPTIONS } from '../../types';
import type { DreamCard } from '../../services/cards';
import type { Clarity, DreamType } from '../../types';

export function DreamDetail() {
  // 从路由参数获取梦境 ID
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDream, fetchDream, removeDream, editDream, clearCurrent, isLoading } = useDreamStore();

  // 是否正在删除中
  const [deleting, setDeleting] = useState(false);
  // 是否显示卡片生成器
  const [showCardGenerator, setShowCardGenerator] = useState(false);
  // 已生成的梦境卡片数据
  const [generatedCard, setGeneratedCard] = useState<DreamCard | null>(null);
  // 是否处于编辑模式
  const [editing, setEditing] = useState(false);
  // 是否正在保存编辑
  const [saving, setSaving] = useState(false);

  // 编辑表单的状态变量
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editEmotions, setEditEmotions] = useState<string[]>([]);
  const [editClarity, setEditClarity] = useState<Clarity | undefined>();
  const [editDreamType, setEditDreamType] = useState<DreamType | undefined>();
  const [editScenes, setEditScenes] = useState<string[]>([]);

  // 根据 ID 加载梦境数据，组件卸载时清除当前梦境
  useEffect(() => {
    if (id) fetchDream(id);
    return () => clearCurrent();
  }, [id]);

  /** 删除梦境处理：确认后删除并跳转到时间线页 */
  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('确定要删除这个梦境记录吗？')) return;
    setDeleting(true);
    try {
      await removeDream(id);
      navigate('/timeline');
    } catch {
      setDeleting(false);
    }
  };

  /** 进入编辑模式：将当前梦境数据填充到编辑表单 */
  const startEdit = () => {
    if (!currentDream) return;
    setEditTitle(currentDream.title || '');
    setEditContent(currentDream.content);
    setEditEmotions([...currentDream.emotions]);
    setEditClarity(currentDream.clarity || undefined);
    setEditDreamType(currentDream.dreamType || undefined);
    setEditScenes([...currentDream.scenes]);
    setEditing(true);
  };

  /** 保存编辑：将修改后的数据提交到后端 */
  const handleSave = async () => {
    if (!id || !editContent.trim()) return;
    setSaving(true);
    try {
      await editDream(id, {
        title: editTitle || undefined,
        content: editContent,
        emotions: editEmotions,
        clarity: editClarity,
        dreamType: editDreamType,
        scenes: editScenes,
      });
      setEditing(false);
    } catch {
      // keep editing mode on error
    } finally {
      setSaving(false);
    }
  };

  // 加载中或数据未就绪时显示加载提示
  if (isLoading || !currentDream) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  const dream = currentDream;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* 梦境头部信息卡片 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {dream.title || '无标题梦境'}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(dream.recordedAt).toLocaleString('zh-CN')}
              </p>
            </div>
            {/* 操作按钮区域（非编辑模式下显示） */}
            <div className="flex gap-2">
              {!editing && (
                <>
                  <Button variant="ghost" size="sm" onClick={startEdit}>
                    编辑
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/analyze?dreamId=${dream.id}`)}
                  >
                    AI 解构
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={deleting}
                  >
                    删除
                  </Button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            /* 编辑表单 */
            <div className="space-y-4">
              <Input
                label="梦境标题"
                placeholder="给这个梦起个名字..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <Textarea
                label="梦境内容"
                placeholder="描述你的梦境..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                required
              />
              {/* 情绪标签编辑 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">情绪标签</label>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_OPTIONS.map((emotion) => (
                    <Tag
                      key={emotion}
                      label={emotion}
                      variant="emotion"
                      selected={editEmotions.includes(emotion)}
                      onClick={() =>
                        setEditEmotions((prev) =>
                          prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
                        )
                      }
                      size="md"
                    />
                  ))}
                </div>
              </div>
              {/* 清晰度编辑 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">梦境清晰度</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(CLARITY_LABELS) as [Clarity, string][]).map(([value, label]) => (
                    <Tag
                      key={value}
                      label={label}
                      selected={editClarity === value}
                      onClick={() => setEditClarity(editClarity === value ? undefined : value)}
                      size="md"
                    />
                  ))}
                </div>
              </div>
              {/* 梦境类型编辑 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">梦境类型</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(DREAM_TYPE_LABELS) as [DreamType, string][]).map(([value, label]) => (
                    <Tag
                      key={value}
                      label={label}
                      selected={editDreamType === value}
                      onClick={() => setEditDreamType(editDreamType === value ? undefined : value)}
                      size="md"
                    />
                  ))}
                </div>
              </div>
              {/* 场景标签编辑 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">场景标签</label>
                <div className="flex flex-wrap gap-2">
                  {SCENE_OPTIONS.map((scene) => (
                    <Tag
                      key={scene}
                      label={scene}
                      variant="scene"
                      selected={editScenes.includes(scene)}
                      onClick={() =>
                        setEditScenes((prev) =>
                          prev.includes(scene) ? prev.filter((s) => s !== scene) : [...prev, scene]
                        )
                      }
                      size="md"
                    />
                  ))}
                </div>
              </div>
              {/* 保存/取消按钮 */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={handleSave} isLoading={saving}>
                  保存
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 标签展示区 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {dream.emotions.map((emotion) => (
                  <Tag key={emotion} label={emotion} variant="emotion" size="md" />
                ))}
                {dream.clarity && (
                  <Tag label={CLARITY_LABELS[dream.clarity]} size="md" />
                )}
                {dream.dreamType && (
                  <Tag label={DREAM_TYPE_LABELS[dream.dreamType]} size="md" />
                )}
                {dream.scenes.map((scene) => (
                  <Tag key={scene} label={scene} variant="scene" size="md" />
                ))}
              </div>

              {/* 梦境内容展示 */}
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {dream.content}
                </p>
              </div>

              {/* AI 摘要展示（如有） */}
              {dream.aiSummary && (
                <div className="mt-6 p-4 bg-dream-purple/10 border border-dream-purple/20 rounded-xl">
                  <h3 className="text-sm font-medium text-dream-purple mb-2">AI 摘要</h3>
                  <p className="text-sm text-gray-300">{dream.aiSummary}</p>
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>

      {/* 梦境卡片生成与展示区域 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">梦境卡片</h2>
          {/* 未生成卡片时显示"生成卡片"按钮 */}
          {!showCardGenerator && !generatedCard && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCardGenerator(true)}
            >
              生成卡片
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* 卡片生成器 */}
          {showCardGenerator && !generatedCard && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <CardGenerator
                  dreamId={dream.id}
                  onGenerated={(card) => {
                    setGeneratedCard(card);
                    setShowCardGenerator(false);
                  }}
                />
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCardGenerator(false)}
                  >
                    取消
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* 已生成的卡片展示 */}
          {generatedCard && (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DreamCardVisual card={generatedCard} />
              <div className="flex gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/gallery')}
                >
                  查看画廊
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGeneratedCard(null);
                    setShowCardGenerator(true);
                  }}
                >
                  重新生成
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 关联的 AI 解构对话列表 */}
      {dream.sessions && dream.sessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-white mb-3">解构对话</h2>
          <div className="space-y-2">
            {dream.sessions.map((session) => (
              <Card
                key={session.id}
                hoverable
                onClick={() => navigate(`/analyze/${session.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{session.title || '解构对话'}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  {/* 心理学派标签 */}
                  <span className="text-xs px-2 py-1 rounded-md bg-dream-cyan/10 text-dream-cyan">
                    {session.school}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
