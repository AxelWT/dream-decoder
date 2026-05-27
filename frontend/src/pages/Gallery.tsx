import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { DreamCardVisual } from '../components/VisualCard/DreamCardVisual';
import { getCards, deleteCard, type DreamCard, type PaginatedCards } from '../services/cards';

export function Gallery() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedCards | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<DreamCard | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadCards(1);
  }, []);

  async function loadCards(p: number) {
    try {
      const result = await getCards(p);
      setData(result);
      setPage(p);
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCard(id);
      setData((prev) => prev ? {
        ...prev,
        cards: prev.cards.filter((c) => c.id !== id),
        total: prev.total - 1,
      } : null);
      if (selectedCard?.id === id) setSelectedCard(null);
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-dream-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = data?.cards || [];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">梦境画廊</h1>
            <p className="text-sm text-gray-400">
              {data?.total ? `共 ${data.total} 张卡片` : '用视觉卡片记录你的梦境'}
            </p>
          </div>
        </div>

        {cards.length === 0 ? (
          <Card className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-night-700 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">还没有梦境卡片</p>
            <p className="text-sm text-gray-500 mb-6">在梦境详情页可以生成精美的视觉卡片</p>
            <Button onClick={() => navigate('/timeline')}>去记录梦境</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="cursor-pointer group"
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="relative">
                    <DreamCardVisual card={card} compact />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                        查看详情
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => loadCards(page - 1)}
                >
                  上一页
                </Button>
                <span className="px-3 py-1.5 text-sm text-gray-400">
                  {page} / {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => loadCards(page + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Card detail modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <DreamCardVisual card={selectedCard} />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setSelectedCard(null)}
                >
                  关闭
                </Button>
                {selectedCard.dream && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCard(null);
                      navigate(`/dream/${selectedCard.dreamId}`);
                    }}
                  >
                    查看梦境
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(selectedCard.id)}
                >
                  删除
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
