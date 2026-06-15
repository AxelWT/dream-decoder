/**
 * @file share.ts
 * @description 分享工具模块，提供剪贴板复制和梦境分享功能。
 *              优先使用 Web Share API（移动端），不支持时回退到剪贴板复制。
 */

/**
 * 复制文本到剪贴板
 * 优先使用 Clipboard API，不支持时回退到 execCommand
 * @param text - 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用现代 Clipboard API
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 回退方案：创建临时 textarea 并使用 execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }
}

/**
 * 分享梦境
 * 优先使用 Web Share API（弹出系统分享面板），用户取消或不支持时回退到复制链接
 * @param title - 梦境标题
 * @param dreamId - 梦境 ID（用于拼接分享链接）
 * @returns 是否分享/复制成功
 */
export async function shareDream(title: string, dreamId: string): Promise<boolean> {
  const url = `${window.location.origin}/dream/${dreamId}`;

  // 尝试使用系统分享功能
  if (navigator.share) {
    try {
      await navigator.share({
        title: `梦境解构 - ${title || '无标题'}`,
        text: `来看看我的梦境解读：${title || '无标题梦境'}`,
        url,
      });
      return true;
    } catch {
      // 用户取消分享，回退到复制链接
    }
  }

  // 回退：复制链接到剪贴板
  return copyToClipboard(url);
}
