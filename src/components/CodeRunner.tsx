import { useEffect, useRef, useState } from 'react';
import { Eye, Play, RotateCcw, ShieldCheck, Wand2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { detectLanguage } from '../lib/detectLanguage';
import { isRunnable } from '../lib/runnable';

/** Python runs in the browser via Pyodide (CPython compiled to WebAssembly), inside the sandbox. */
export const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';

export interface LogLine {
  type: 'log' | 'info' | 'warn' | 'error';
  text: string;
}

interface CodeRunnerProps {
  code: string;
  language: string;
  /** Called for every console line the code produces (e.g. to detect a passed exercise). */
  onLog?: (line: LogLine) => void;
  /** Extra markup rendered under CSS snippets. */
  demo?: string;
  onClose?: () => void;
}

// Injected before user code: forwards console output and errors to the parent window.
const CONSOLE_BRIDGE = `<script>
(function () {
  function fmt(a) {
    if (typeof a === 'string') return a;
    if (a instanceof Error) return a.name + ': ' + a.message;
    if (typeof a === 'bigint') return a.toString() + 'n';
    try { return JSON.stringify(a, function (k, v) {
      if (typeof v === 'bigint') return v.toString() + 'n';
      if (v instanceof Map) return Object.fromEntries(v);
      if (v instanceof Set) return Array.from(v);
      return v;
    }, 2); } catch (e) { return String(a); }
  }
  function send(type, args) {
    parent.postMessage({ __pestle: true, type: type, text: Array.prototype.map.call(args, fmt).join(' ') }, '*');
  }
  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (k) {
    var original = console[k];
    console[k] = function () { send(k === 'debug' ? 'log' : k, arguments); original.apply(console, arguments); };
  });
  console.table = console.log;
  window.onerror = function (msg) { send('error', [String(msg)]); };
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    send('error', ['Uncaught (in promise) ' + (r && r.message ? r.message : String(r))]);
  });
})();
</script>`;

const escapeScript = (code: string) => code.replace(/<\/script/gi, '<\\/script');

/** Serializes a string into a JS literal that is safe to embed inside an inline <script>. */
const jsLiteral = (value: string) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const PYTHON_BOOT = `(async function () {
  console.info('Loading Python… (the first run downloads the runtime, ~10 MB)');
  var code = __CODE__;
  var py;
  try {
    py = await loadPyodide({
      indexURL: __INDEX__,
      stdout: function (s) { console.log(s); },
      stderr: function (s) { console.error(s); },
      stdin: function () { return null; },
    });
    await py.loadPackagesFromImports(code, { messageCallback: function () {}, errorCallback: function () {} });
  } catch (e) {
    console.error('Could not load Python: ' + (e && e.message ? e.message : e));
    return;
  }
  try {
    await py.runPythonAsync(code);
  } catch (e) {
    var lines = String(e && e.message ? e.message : e).trim().split('\\n');
    var mine = function (tag) { return lines.findIndex(function (l) { return l.indexOf('File "' + tag + '"') !== -1; }); };
    var start = mine('<tu código>');
    if (start < 0) start = mine('<exec>');
    console.error((start > 0 ? ['Traceback (most recent call last):'].concat(lines.slice(start)) : lines.slice(-6)).join('\\n'));
    if (/ModuleNotFoundError/.test(String(e))) {
      console.warn('This package is not available in the browser. Run it locally with: python script.py');
    }
  }
})();`;

export function buildDocument(code: string, language: string, demo?: string) {
  if (language === 'python') {
    const boot = PYTHON_BOOT.replace('__CODE__', () => jsLiteral(code)).replace('__INDEX__', () => jsLiteral(PYODIDE_URL));
    return `<!doctype html><html><body>${CONSOLE_BRIDGE}<script src="${PYODIDE_URL}pyodide.js"></script><script>${boot}</script></body></html>`;
  }
  if (language === 'javascript') {
    return `<!doctype html><html><body>${CONSOLE_BRIDGE}<script type="module">\n${escapeScript(code)}\n</script></body></html>`;
  }
  if (language === 'css') {
    return `<!doctype html><html><head><style>body{font-family:system-ui,sans-serif;padding:16px}</style><style>${code}</style></head><body>${CONSOLE_BRIDGE}${demo ?? ''}</body></html>`;
  }
  // html: inject the console bridge as early as possible
  if (/<head[^>]*>/i.test(code)) return code.replace(/<head[^>]*>/i, (m) => m + CONSOLE_BRIDGE);
  return CONSOLE_BRIDGE + code;
}

const LANGUAGE_NAMES: Record<string, string> = { javascript: 'JavaScript', python: 'Python', html: 'HTML', css: 'CSS' };

const LOG_TYPES = new Set(['log', 'info', 'warn', 'error']);
const MAX_LOG_LENGTH = 10_000;

/**
 * Runs JavaScript, HTML or CSS inside /runner.html, loaded in a sandboxed iframe (scripts and
 * forms allowed, but an opaque origin: no access to this page, its cookies or storage, no
 * popups or top-level navigation) and shows console output.
 */
export default function CodeRunner({ code, language, demo, onClose, onLog }: CodeRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [runId, setRunId] = useState(0);
  // Code saved under the wrong language (e.g. Python pasted while "JavaScript" was selected)
  // runs with the interpreter it actually needs.
  const detected = detectLanguage(code);
  const effectiveLanguage =
    detected && ((language === 'javascript' && detected === 'python') || (!isRunnable(language) && isRunnable(detected)))
      ? detected
      : language;
  const showsPreview = effectiveLanguage === 'html' || effectiveLanguage === 'css';
  // Debounce so live editing does not re-execute on every keystroke.
  const [debouncedCode, setDebouncedCode] = useState(code);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCode(code), 500);
    return () => clearTimeout(t);
  }, [code]);

  const onLogRef = useRef(onLog);
  onLogRef.current = onLog;
  const documentRef = useRef('');
  documentRef.current = buildDocument(debouncedCode, effectiveLanguage, demo);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const frame = iframeRef.current?.contentWindow;
      if (!frame || e.source !== frame || typeof e.data !== 'object' || e.data === null) return;
      if (e.data.__pestleReady === true) {
        // The runner has an opaque origin, so '*' is the only target that can reach it; it
        // only accepts this message from its parent window.
        frame.postMessage({ __pestleRun: true, html: documentRef.current }, '*');
        return;
      }
      if (e.data.__pestle !== true || !LOG_TYPES.has(e.data.type) || typeof e.data.text !== 'string') return;
      const text = e.data.text.length > MAX_LOG_LENGTH ? e.data.text.slice(0, MAX_LOG_LENGTH) + '…' : e.data.text;
      setLogs((prev) => [...prev.slice(-199), { type: e.data.type, text }]);
      onLogRef.current?.({ type: e.data.type, text });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    setLogs([]);
  }, [runId, debouncedCode]);

  const languageName = LANGUAGE_NAMES[effectiveLanguage] ?? effectiveLanguage;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card animate-fade-up">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          {showsPreview ? <Eye className="size-4 text-success" aria-hidden /> : <Play className="size-4 text-success" aria-hidden />}
          {showsPreview ? 'Live preview' : 'Output'}
          <span className="font-normal text-muted">· {languageName}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRunId((n) => n + 1)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-muted hover:bg-surface-2 hover:text-fg transition-colors"
            title="Run again"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Run again
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Close output"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <p className="flex items-center gap-1.5 border-b border-line bg-surface-2/60 px-4 py-1.5 text-[11px] text-muted">
        <ShieldCheck className="size-3.5 text-success" aria-hidden />
        Runs in an isolated sandbox: this code can't read your Pestle data, cookies or storage.
      </p>
      {effectiveLanguage !== language && (
        <p className="flex items-center gap-1.5 border-b border-line bg-accent-soft px-4 py-1.5 text-xs text-accent">
          <Wand2 className="size-3.5" aria-hidden />
          Detected {languageName} code, running it with {languageName}.
        </p>
      )}

      <iframe
        key={`${runId}-${debouncedCode}`}
        ref={iframeRef}
        title="Code runner"
        sandbox="allow-scripts allow-forms"
        src="/runner.html"
        className={cn('w-full bg-white', showsPreview ? 'h-80 border-b border-line' : 'hidden')}
      />

      <div className="max-h-72 space-y-1 overflow-auto bg-console p-4 font-mono text-xs text-console-fg" aria-live="polite" aria-label="Console output">
        {logs.length === 0 ? (
          <p className="text-console-fg/50">{showsPreview ? 'Console output appears here' : 'Running…'}</p>
        ) : (
          logs.map((line, i) => (
            <pre
              key={i}
              className={cn(
                'whitespace-pre-wrap break-words',
                line.type === 'error' && 'text-red-400',
                line.type === 'warn' && 'text-amber-300',
                line.type === 'info' && 'text-sky-300'
              )}
            >
              {line.type === 'error' ? '✕ ' : line.type === 'warn' ? '⚠ ' : '› '}
              {line.text}
            </pre>
          ))
        )}
      </div>
    </div>
  );
}
