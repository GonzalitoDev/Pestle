import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCode, Globe, Link2, Timer, FolderOpen, Search, AlertCircle, Plus } from 'lucide-react';
import { pasteService } from '../lib/pasteService';
import { Paste } from '../types';
import { timeAgo } from '../lib/utils';
import { Badge, Card, EmptyState, LanguageBadge, PageHeader, buttonClass } from '../components/ui';

export default function Dashboard() {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    pasteService
      .getMyPastes()
      .then(setPastes)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pastes;
    return pastes.filter(
      (p) => (p.title ?? '').toLowerCase().includes(q) || p.language.includes(q) || p.content.toLowerCase().includes(q)
    );
  }, [pastes, query]);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        icon={FolderOpen}
        title="My pastes"
        description="Pastes created from this browser. Only you can delete them."
        actions={
          <Link to="/" className={buttonClass('primary')}>
            <Plus className="size-4" aria-hidden /> New paste
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={AlertCircle} title="Could not load your pastes" description={error} />
      ) : pastes.length === 0 ? (
        <EmptyState
          icon={FileCode}
          title="No pastes yet"
          description="Everything you publish from this browser shows up here."
          action={
            <Link to="/" className={buttonClass('primary')}>
              Create your first paste
            </Link>
          }
        />
      ) : (
        <>
          {pastes.length > 3 && (
            <label className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 focus-within:border-accent">
              <Search className="size-4 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your pastes"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </label>
          )}
          <Card className="divide-y divide-line overflow-hidden">
            {filtered.map((paste) => (
              <Link
                key={paste.id}
                to={`/paste/${paste.id}`}
                className="group flex items-center gap-4 px-4 py-3.5 hover:bg-surface-2 transition-colors"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2 group-hover:bg-surface">
                  <FileCode className="size-5 text-muted" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium group-hover:text-accent">{paste.title || 'Untitled paste'}</p>
                  <p className="truncate font-mono text-xs text-muted">{paste.content.split('\n')[0]}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <LanguageBadge language={paste.language} />
                  {paste.isPublic ? (
                    <Badge tone="accent">
                      <Globe className="size-3" /> Public
                    </Badge>
                  ) : (
                    <Badge>
                      <Link2 className="size-3" /> Unlisted
                    </Badge>
                  )}
                  {paste.expiresAt && (
                    <Badge tone="warn">
                      <Timer className="size-3" /> {timeAgo(paste.expiresAt)}
                    </Badge>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted w-24 text-right">{timeAgo(paste.createdAt)}</span>
              </Link>
            ))}
            {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No pastes match “{query}”.</p>}
          </Card>
          <p className="text-xs text-muted">
            {pastes.length} {pastes.length === 1 ? 'paste' : 'pastes'}
          </p>
        </>
      )}
    </div>
  );
}
