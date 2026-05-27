import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Tag } from '../UI/Tag';
import { CardGenerator } from '../VisualCard/CardGenerator';
import { DreamCardVisual } from '../VisualCard/DreamCardVisual';
import { useDreamStore } from '../../stores/dreamStore';
import { CLARITY_LABELS, DREAM_TYPE_LABELS } from '../../types';
import type { DreamCard } from '../../services/cards';

export function DreamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDream, fetchDream, removeDream, clearCurrent, isLoading } = useDreamStore();
  const [deleting, setDeleting] = useState(false);
  const [showCardGenerator, setShowCardGenerator] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<DreamCard | null>(null);

  useEffect(() => {
    if (id) fetchDream(id);
    return () => clearCurrent();
  }, [id]);

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
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* Header */}
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
            <div className="flex gap-2">
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
            </div>
          </div>

          {/* Tags */}
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

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {dream.content}
            </p>
          </div>

          {/* AI Summary */}
          {dream.aiSummary && (
            <div className="mt-6 p-4 bg-dream-purple/10 border border-dream-purple/20 rounded-xl">
              <h3 className="text-sm font-medium text-dream-purple mb-2">AI 摘要</h3>
              <p className="text-sm text-gray-300">{dream.aiSummary}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Visual Card Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">梦境卡片</h2>
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

      {/* Chat sessions */}
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
