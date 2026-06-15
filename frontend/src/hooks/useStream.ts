/**
 * @file useStream.ts
 * @description 通用流式数据 Hook，封装 AsyncGenerator 的消费逻辑。
 *              提供流式内容的累积状态、正在流式传输的标志、
 *              以及启动流和重置的方法。适用于 AI 对话等流式场景。
 */
import { useState, useCallback, useRef } from 'react';

export function useStream() {
  /** 累积的流式内容 */
  const [content, setContent] = useState('');
  /** 是否正在接收流式数据 */
  const [isStreaming, setIsStreaming] = useState(false);
  /** 中断控制器引用（预留，当前未使用） */
  const abortRef = useRef<AbortController | null>(null);

  /**
   * 启动流式数据接收
   * @param streamFn - 返回 AsyncGenerator 的函数
   * @param onChunk - 每接收一块数据时的回调（可选）
   * @param onComplete - 流式接收完成时的回调，返回完整内容（可选）
   */
  const startStream = useCallback(async (
    streamFn: AsyncGenerator<string>,
    onChunk?: (chunk: string) => void,
    onComplete?: (fullContent: string) => void
  ) => {
    setContent('');
    setIsStreaming(true);
    let fullContent = '';

    try {
      // 逐块消费 AsyncGenerator
      for await (const chunk of streamFn) {
        fullContent += chunk;
        setContent(fullContent); // 更新累积内容
        onChunk?.(chunk);
      }
      onComplete?.(fullContent);
    } catch (err) {
      console.error('Stream error:', err);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  /** 重置流式状态，中断正在进行的流 */
  const reset = useCallback(() => {
    setContent('');
    setIsStreaming(false);
    abortRef.current?.abort();
  }, []);

  return { content, isStreaming, startStream, reset };
}
