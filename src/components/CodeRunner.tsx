import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogLine {
  type: 'log' | 'info' | 'warn' | 'error';
  text: string;
}

interface CodeRunnerProps {
  code: string;
  language: string;
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

export function buildDocument(code: string, language: string, demo?: string) {
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

/**
 * Runs JavaScript, HTML or CSS inside a sandboxed iframe (scripts and forms allowed, no access
 * to this page, its cookies or storage) and shows console output.
 */
export default function CodeRunner({ code, language, demo, onClose }: CodeRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [runId, setRunId] = useState(0);
  const showsPreview = language !== 'javascript';
  // Debounce so live editing does not re-execute on every keystroke.
  const [debouncedCode, setDebouncedCode] = useState(code);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCode(code), 500);
    return () => clearTimeout(t);
  }, [code]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow || !e.data?.__pestle) return;
      setLogs((prev) => [...prev.slice(-199), { type: e.data.type, text: e.data.text }]);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    setLogs([]);
  }, [runId, debouncedCode]);

  return (
    <div className="border border-[#141414] bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
      <div className="border-b border-[#141414] px-4 py-2 flex items-center justify-between bg-[#f8f8f7]">
        <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest">
          <Play size={12} /> {showsPreview ? 'LIVE_PREVIEW' : 'EXECUTION_OUTPUT'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRunId((n) => n + 1)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
            title="Run again"
          >
            <RotateCcw size={12} /> RERUN
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors" title="Close">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <iframe
        key={`${runId}-${debouncedCode}`}
        ref={iframeRef}
        title="Code runner"
        sandbox="allow-scripts allow-modals allow-forms"
        srcDoc={buildDocument(debouncedCode, language, demo)}
        className={cn('w-full bg-white', showsPreview ? 'h-80 border-b border-[#141414]/10' : 'hidden')}
      />

      <div className="bg-[#141414] text-[#E4E3E0] font-mono text-xs p-4 max-h-72 overflow-auto space-y-1" aria-live="polite">
        {logs.length === 0 ? (
          <p className="opacity-40">{showsPreview ? '// console output appears here' : '// running… (no output yet)'}</p>
        ) : (
          logs.map((line, i) => (
            <pre
              key={i}
              className={cn(
                'whitespace-pre-wrap break-words',
                line.type === 'error' && 'text-red-400',
                line.type === 'warn' && 'text-yellow-300'
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
