/**
 * Share utilities for dream cards
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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

export async function shareDream(title: string, dreamId: string): Promise<boolean> {
  const url = `${window.location.origin}/dream/${dreamId}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `梦境解构 - ${title || '无标题'}`,
        text: `来看看我的梦境解读：${title || '无标题梦境'}`,
        url,
      });
      return true;
    } catch {
      // User cancelled, fall through to copy
    }
  }

  return copyToClipboard(url);
}
