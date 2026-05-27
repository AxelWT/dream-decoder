import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ChatPanel } from '../components/Chat/ChatPanel';
import { Button } from '../components/UI/Button';
import { useChatStore } from '../stores/chatStore';
import { useDreamStore } from '../stores/dreamStore';
import { useNavigate } from 'react-router-dom';
import { SCHOOL_LABELS } from '../types';

export function Analyze() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const dreamId = searchParams.get('dreamId') || undefined;
  const navigate = useNavigate();

  const { sessions, fetchSessions, removeSession } = useChatStore();
  const { dreams, fetchDreams } = useDreamStore();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchDreams(1);
  }, []);

  const dream = dreams.find((d) => d.id === dreamId);

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Sidebar - collapsible on all screen sizes */}
      <div className={`
        ${showHistory ? 'w-72' : 'w-12'} transition-all duration-300 border-r border-night-700/50 bg-night-900/50 flex flex-col
      `}>
        {/* Toggle button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-3 text-gray-400 hover:text-white transition-colors border-b border-night-700/50 flex items-center justify-center"
          title={showHistory ? '收起侧边栏' : '展开侧边栏'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showHistory ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>

        {/* Collapsed icon bar */}
        {!showHistory && (
          <div className="flex flex-col items-center gap-2 py-3">
            {/* New chat button */}
            <button
              onClick={() => {
                navigate('/analyze');
                window.location.reload();
              }}
              className="w-8 h-8 rounded-lg bg-dream-purple/10 hover:bg-dream-purple/20 flex items-center justify-center transition-colors"
              title="新对话"
            >
              <svg className="w-4 h-4 text-dream-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Dream list quick entry */}
            <button
              onClick={() => navigate('/dreams')}
              className="w-8 h-8 rounded-lg hover:bg-night-800/50 flex items-center justify-center transition-colors"
              title="梦境记录"
            >
              <svg className="w-4 h-4 text-dream-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            {/* Recent sessions icons */}
            {sessions.slice(0, 5).map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/analyze/${session.id}`)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs font-medium
                  ${session.id === sessionId
                    ? 'bg-dream-purple/20 text-dream-purple'
                    : 'hover:bg-night-800/50 text-gray-500'
                  }
                `}
                title={session.title || '对话'}
              >
                {(session.title || '对')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Expanded sidebar content */}
        {showHistory && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-400">对话历史</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/analyze');
                  window.location.reload();
                }}
              >
                新对话
              </Button>
            </div>

            {/* Dream selection quick entry */}
            <button
              onClick={() => navigate('/dreams')}
              className="w-full p-3 rounded-xl border border-dashed border-night-600 hover:border-dream-cyan/40 hover:bg-night-800/30 transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-dream-cyan group-hover:text-dream-cyan/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm text-gray-400 group-hover:text-gray-300">选择梦境记录</span>
              </div>
            </button>

            {dreamId && dream && (
              <div className="p-3 bg-dream-purple/10 border border-dream-purple/20 rounded-xl">
                <p className="text-xs text-dream-purple mb-1">正在解构</p>
                <p className="text-sm text-white font-medium truncate">
                  {dream.title || '无标题梦境'}
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    group p-3 rounded-xl cursor-pointer transition-all
                    ${session.id === sessionId
                      ? 'bg-dream-purple/15 border border-dream-purple/20'
                      : 'hover:bg-night-800/50'
                    }
                  `}
                  onClick={() => navigate(`/analyze/${session.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white truncate flex-1">
                      {session.title || '对话'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all ml-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(session.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="text-xs text-dream-cyan">
                      {SCHOOL_LABELS[session.school as keyof typeof SCHOOL_LABELS]}
                    </span>
                  </div>
                </div>
              ))}

              {sessions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">暂无对话</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel dreamId={dreamId} sessionId={sessionId} />
      </div>
    </div>
  );
}
