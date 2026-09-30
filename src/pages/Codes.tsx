import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, Copy, Download, Library, Pencil, Play, Search, Terminal, X, SearchX } from 'lucide-react';
import { SNIPPETS, Snippet, isRunnable } from '../data/snippets';
import CodeRunner from '../components/CodeRunner';
import CodeBlock from '../components/CodeBlock';
import { Button, Card, EmptyState, Kbd, LanguageBadge, PageHeader } from '../components/ui';
import { cn, copyText, downloadText } from '../lib/utils';
import { useToast } from '../components/Toast';

const COLLAPSED_LINES = 16;

export default function Codes() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const topic = params.get('tema') ?? 'all';
  const searchRef = useRef<HTMLInputElement>(null);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  // "/" focuses the search box, like on GitHub.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const topicFilters = useMemo(() => {
    const counts = new Map<string, number>();
    SNIPPETS.forEach((s) => s.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [
      { value: 'all', label: 'Todos', count: SNIPPETS.length },
      ...[...counts].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ value: t, label: t, count: n })),
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SNIPPETS.filter(
      (s) =>
        (topic === 'all' || s.tags.includes(topic)) &&
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q)) ||
          s.code.toLowerCase().includes(q))
    );
  }, [query, topic]);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        icon={Library}
        title="Biblioteca de ejemplos"
        description={`${SNIPPETS.length} programas en Python listos para ejecutar. Probalos acá, copialos o abrilos en el editor para cambiarlos y compartirlos.`}
      />

      <div className="sticky top-16 z-30 -mx-4 space-y-3 bg-bg/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 focus-within:border-accent transition-colors">
          <Search className="size-4 text-muted" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            aria-label="Buscar ejemplos"
            value={query}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Buscar: primos, fechas, clases…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {query ? (
            <button onClick={() => updateParam('q', '')} aria-label="Borrar búsqueda" className="text-muted hover:text-fg">
              <X className="size-4" />
            </button>
          ) : (
            <Kbd>/</Kbd>
          )}
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por tema">
          {topicFilters.map((l) => (
            <button
              key={l.value}
              role="tab"
              aria-selected={topic === l.value}
              onClick={() => updateParam('tema', l.value)}
              className={cn(
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
                topic === l.value
                  ? 'border-fg bg-fg text-bg'
                  : 'border-line bg-surface text-muted hover:text-fg hover:border-line-strong'
              )}
            >
              <span>{l.label}</span>
              <span className={cn('text-xs', topic === l.value ? 'opacity-70' : 'text-muted')}>{l.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Ningún ejemplo coincide con tu búsqueda"
          description="Probá con otra palabra o borrá los filtros."
          action={
            <Button onClick={() => setParams({}, { replace: true })}>Borrar filtros</Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} onTag={(t) => updateParam('q', t)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SnippetCard({ snippet, onTag }: { snippet: Snippet; onTag: (tag: string) => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const lineCount = snippet.code.split('\n').length;
  const [expanded, setExpanded] = useState(lineCount <= COLLAPSED_LINES + 4);
  const runnable = isRunnable(snippet.language) && !snippet.runLocally;

  const copy = async () => {
    await copyText(snippet.code);
    setCopied(true);
    toast(`Copiaste “${snippet.title}”`);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInEditor = () =>
    navigate('/', { state: { title: snippet.title, content: snippet.code, language: snippet.language } });

  const visibleCode = expanded ? snippet.code : snippet.code.split('\n').slice(0, COLLAPSED_LINES).join('\n');

  return (
    <article id={snippet.id} className="scroll-mt-40">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <LanguageBadge language={snippet.language} />
              {snippet.tags.map((t) => (
                <button
                  key={t}
                  onClick={() => onTag(t)}
                  className="rounded-md px-1.5 py-0.5 text-xs text-muted hover:bg-surface-2 hover:text-fg"
                >
                  #{t}
                </button>
              ))}
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{snippet.title}</h2>
            <p className="text-sm text-muted max-w-2xl">{snippet.description}</p>
            {snippet.runLocally && (
              <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <Terminal className="size-3.5 shrink-0" aria-hidden />
                Necesita un servidor, ejecutalo en tu compu:
                <code className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-fg break-all">
                  {snippet.runLocally}
                </code>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {runnable && (
              <Button variant="success" size="sm" icon={running ? X : Play} onClick={() => setRunning((r) => !r)}>
                {running ? 'Ocultar' : 'Ejecutar'}
              </Button>
            )}
            <Button size="sm" icon={copied ? Check : Copy} onClick={copy}>
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            <Button size="sm" icon={Pencil} onClick={openInEditor} title="Abrir en el editor para modificarlo y compartirlo">
              Editar y compartir
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Download}
              aria-label={`Descargar ${snippet.title}`}
              onClick={() =>
                downloadText(snippet.code, snippet.id, snippet.language)
                  .then((where) => where && toast(`Guardado en ${where}`))
                  .catch((err) => toast(`No se pudo guardar: ${err instanceof Error ? err.message : err}`, 'error'))
              }
            />
          </div>
        </div>

        <div className={cn('grid grid-cols-1 border-t border-line', running && 'xl:grid-cols-2')}>
          <div className="relative min-w-0 bg-surface-2/40">
            <div className="overflow-x-auto">
              <CodeBlock code={visibleCode} language={snippet.language} />
            </div>
            {!expanded && (
              <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-surface via-surface/90 to-transparent pb-3 pt-12">
                <Button size="sm" icon={ChevronDown} onClick={() => setExpanded(true)}>
                  Ver las {lineCount} líneas
                </Button>
              </div>
            )}
          </div>
          {running && (
            <div className="border-t border-line p-4 xl:border-l xl:border-t-0">
              <CodeRunner code={snippet.code} language={snippet.language} demo={snippet.demo} onClose={() => setRunning(false)} />
            </div>
          )}
        </div>
      </Card>
    </article>
  );
}
