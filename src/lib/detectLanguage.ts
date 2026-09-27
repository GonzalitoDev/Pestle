import { Language } from '../types';

const PYTHON_HINTS = [
  /^\s*from\s+[\w.]+\s+import\s+[\w*(]/m,
  /^\s*import\s+[\w.]+(\s+as\s+\w+)?\s*$/m,
  /^\s*def\s+\w+\s*\(.*\)\s*(->\s*[^:]+)?:\s*$/m,
  /^\s*class\s+\w+(\(.*\))?\s*:\s*$/m,
  /^\s*(if|elif|while|for)\s+.+:\s*$/m,
  /^\s*@[\w.]+(\(.*\))?\s*\n\s*(async\s+)?(def|class)\s/m,
  /^\s*print\(/m,
];

const JS_HINTS = [
  /\b(const|let|var)\s+\w+\s*=/,
  /\bfunction\s*\w*\s*\(/,
  /=>\s*[{(]?/,
  /\bconsole\.\w+\(/,
  /;\s*$/m,
  /\bimport\s+.+\s+from\s+['"]/,
  /\bexport\s+(default|const|function|class)\b/,
];

const TS_HINTS = [/\binterface\s+\w+\s*\{/, /\btype\s+\w+(<.*>)?\s*=/, /:\s*(string|number|boolean|void|unknown|any)\b/, /\bas\s+const\b/];

const count = (patterns: RegExp[], code: string) => patterns.filter((p) => p.test(code)).length;

/**
 * Best-effort guess of a snippet's language from its content, used to pick the right runner
 * and to warn when the selected language doesn't match. Returns null when unsure.
 */
export function detectLanguage(code: string): Language | null {
  const text = code.trim();
  if (!text) return null;

  if (/^(<!doctype html|<html[\s>])/i.test(text) || (/^<[a-z][\w-]*[\s>]/i.test(text) && /<\/[a-z][\w-]*>\s*$/i.test(text))) {
    return 'html';
  }

  if (/^[[{]/.test(text)) {
    try {
      JSON.parse(text);
      return 'json';
    } catch {
      // not JSON
    }
  }

  const hasJsKeywords = /\b(const|let|var|function|return|console)\b|=>/.test(text);
  if (!hasJsKeywords && count(PYTHON_HINTS, text) === 0 && /^\s*(@[\w-]+[^{]*|[.#:*[]?[\w\-\s,.#:>*[\]="()]+)\{\s*[\w-]+\s*:[^{}]*\}/m.test(text)) return 'css';

  const py = count(PYTHON_HINTS, text);
  const js = count(JS_HINTS, text);
  const ts = count(TS_HINTS, text);

  if (py >= 1 && py > js) return 'python';
  if (js >= 1) return ts >= 1 ? 'typescript' : 'javascript';

  if (/^#{1,6}\s+\S/m.test(text) || /^\s*[-*]\s+\S/m.test(text)) return 'markdown';

  return null;
}
