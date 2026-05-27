import { useState, useCallback, useRef } from 'react';

export function useStream() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (
    streamFn: AsyncGenerator<string>,
    onChunk?: (chunk: string) => void,
    onComplete?: (fullContent: string) => void
  ) => {
    setContent('');
    setIsStreaming(true);
    let fullContent = '';

    try {
      for await (const chunk of streamFn) {
        fullContent += chunk;
        setContent(fullContent);
        onChunk?.(chunk);
      }
      onComplete?.(fullContent);
    } catch (err) {
      console.error('Stream error:', err);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setIsStreaming(false);
    abortRef.current?.abort();
  }, []);

  return { content, isStreaming, startStream, reset };
}
