/**
 * @file api.ts
 * @description API 客户端封装，提供统一的 HTTP 请求方法（GET/POST/PUT/DELETE）
 *              以及 SSE 流式请求方法（streamPost）。自动管理 Authorization token，
 *              统一处理错误响应。基于 fetch API 实现。
 */

/** API 基础路径前缀 */
const API_BASE = '/api';

/** API 客户端类，封装所有与后端通信的方法 */
class ApiClient {
  /** 当前用户的认证 token */
  private token: string | null = null;

  /** 设置认证 token */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * 通用请求方法
   * @param path - 请求路径（会自动拼接 API_BASE）
   * @param options - fetch 请求选项
   * @returns 解析后的 JSON 响应数据
   * @throws 当 HTTP 状态码非 2xx 时抛出错误
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 如有 token，自动添加 Authorization 头
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    // 非 2xx 响应时解析错误信息并抛出
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /** 发送 GET 请求 */
  async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  /** 发送 POST 请求 */
  async post<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /** 发送 PUT 请求 */
  async put<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /** 发送 DELETE 请求 */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  /**
   * 流式 POST 请求（用于 AI 对话的 SSE 流式响应）
   * 使用 AsyncGenerator 逐行读取服务端推送的数据
   * @param path - 请求路径
   * @param body - 请求体
   * @yields 解析后的 content 字段内容
   */
  async *streamPost(path: string, body: any): AsyncGenerator<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // 获取 ReadableStream 的 reader
    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder();
    let buffer = ''; // 未处理完的数据缓冲区

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 将新数据追加到缓冲区
      buffer += decoder.decode(value, { stream: true });
      // 按换行符分割，最后一个可能不完整，保留在缓冲区
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        // 跳过空行和非 data 行
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        // 收到 [DONE] 标记表示流结束
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          // 提取 content 字段并 yield
          if (parsed.content) {
            yield parsed.content;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}

/** 导出 API 客户端单例 */
export const api = new ApiClient();
