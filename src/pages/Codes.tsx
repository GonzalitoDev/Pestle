import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Download, Library, Pencil, Play, Search, Terminal } from 'lucide-react';
import { SNIPPETS, Snippet, isRunnable } from '../data/snippets';
import { LANGUAGES } from '../types';
import CodeRunner from '../components/CodeRunner';
import { cn, downloadText } from '../lib/utils';

export default function Codes() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const language = params.get('lang') ?? 'all';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const languagesInLibrary = useMemo(
    () => LANGUAGES.filter((l) => SNIPPETS.some((s) => s.language === l.value)),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SNIPPETS.filter(
      (s) =>
        (language === 'all' || s.language === language) &&
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q)) ||
          s.code.toLowerCase().includes(q))
    );
  }, [query, language]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-mono font-bold tracking-tighter flex items-center gap-3">
          <Library size={28} /> CODE_LIBRARY
        </h1>
        <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-40">
          {SNIPPETS.length} working snippets · run, copy, edit or share them
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-3">
        <label className="flex-1 flex items-center gap-2 border border-[#141414] bg-white px-3 py-2">
          <Search size={14} className="opacity-40" />
          <input
            type="search"
            value={query}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="SEARCH: debounce, fetch, layout…"
            className="w-full bg-transparent outline-none font-mono text-xs"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {[{ value: 'all', label: 'All' }, ...languagesInLibrary].map((l) => (
            <button
              key={l.value}
              onClick={() => updateParam('lang', l.value)}
              className={cn(
                'px-3 py-2 text-[10px] font-mono uppercase tracking-wider border transition-colors',
                language === l.value
                  ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                  : 'bg-white border-[#141414]/20 hover:border-[#141414]'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#141414]/30 p-16 text-center bg-white/50">
          <p className="font-mono text-xs font-bold uppercase tracking-widest opacity-40">NO_MATCHES</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  );
}

function SnippetCard({ snippet }: { snippet: Snippet }) {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const runnable = isRunnable(snippet.language) && !snippet.runLocally;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInEditor = () =>
    navigate('/', {
      state: { title: snippet.title, content: snippet.code, language: snippet.language },
    });

  const buttonClass =
    'flex items-center gap-1.5 px-3 py-1.5 border border-[#141414] bg-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all active:scale-95';

  return (
    <article id={snippet.id} className="border border-[#141414] bg-[#E4E3E0] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] scroll-mt-24">
      <div className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-[#141414]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-[#141414] text-[#E4E3E0] text-[9px] font-mono font-bold uppercase tracking-widest">
              {snippet.language}
            </span>
            {snippet.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 border border-[#141414]/20 text-[9px] font-mono uppercase">
                #{t}
              </span>
            ))}
          </div>
          <h2 className="font-mono font-bold text-lg tracking-tight">{snippet.title}</h2>
          <p className="text-sm opacity-70 max-w-2xl">{snippet.description}</p>
          {snippet.runLocally && (
            <p className="flex items-center gap-2 text-[11px] font-mono">
              <Terminal size={12} className="shrink-0" />
              <span className="opacity-60 uppercase">Needs a real machine · run locally:</span>
              <code className="bg-white border border-[#141414]/10 px-1.5 py-0.5 break-all">{snippet.runLocally}</code>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {runnable && (
            <button
              onClick={() => setRunning((r) => !r)}
              className={cn(buttonClass, running ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-green-100')}
            >
              <Play size={12} /> {running ? 'HIDE' : 'RUN'}
            </button>
          )}
          <button onClick={copy} className={buttonClass}>
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'COPIED' : 'COPY'}
          </button>
          <button onClick={openInEditor} className={buttonClass} title="Open in the editor to modify and share">
            <Pencil size={12} /> EDIT_&_SHARE
          </button>
          <button onClick={() => downloadText(snippet.code, snippet.id, snippet.language)} className={buttonClass}>
            <Download size={12} />
          </button>
        </div>
      </div>

      <div className={cn('grid grid-cols-1', running && 'xl:grid-cols-2')}>
        <div className="bg-white max-h-[420px] overflow-auto">
          <SyntaxHighlighter
            language={snippet.language}
            style={vs}
            customStyle={{ margin: 0, padding: '1.25rem', background: 'white', fontSize: '12px', lineHeight: '1.6' }}
            showLineNumbers
            lineNumberStyle={{ opacity: 0.2, minWidth: '2.5em' }}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
        {running && (
          <div className="p-4 border-t xl:border-t-0 xl:border-l border-[#141414]">
            <CodeRunner code={snippet.code} language={snippet.language} demo={snippet.demo} onClose={() => setRunning(false)} />
          </div>
        )}
      </div>
    </article>
  );
}
