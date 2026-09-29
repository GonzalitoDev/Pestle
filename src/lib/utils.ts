import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isNative } from './platform';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('es-AR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const EXTENSIONS: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'md',
  text: 'txt',
};

/**
 * Save text as a file with the right extension for its language. On the web it triggers a
 * download; in the Android app (where WebView downloads don't work) it writes to Documents.
 * Resolves with a human-readable location on Android, undefined on the web.
 */
export async function downloadText(content: string, name: string, language: string): Promise<string | undefined> {
  const fileName = `${name.replace(/[^\w.-]+/g, '_') || 'snippet'}.${EXTENSIONS[language] ?? 'txt'}`;
  if (isNative) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    await Filesystem.writeFile({ path: `Pestle/${fileName}`, data: content, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true });
    return `Documents/Pestle/${fileName}`;
  }
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return undefined;
}

/** Clipboard write with a fallback for WebViews/browsers where the async Clipboard API is unavailable. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}

/** "3 minutes ago", "in 2 days"… */
export function timeAgo(timestamp: number) {
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.trunc(seconds / size), unit);
  }
  return 'recién';
}
