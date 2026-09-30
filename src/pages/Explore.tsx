import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, RefreshCw, Inbox, AlertCircle } from 'lucide-react';
import { pasteService } from '../lib/pasteService';
import { Paste } from '../types';
import { timeAgo } from '../lib/utils';
import { Button, EmptyState, LanguageBadge, PageHeader, buttonClass } from '../components/ui';

export default function Explore() {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    pasteService
      .getPublicPastes()
      .then((all) => setPastes(all.filter((p) => p.language === 'python')))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        icon={Globe}
        title="Explorar"
        description="Lo último en Python que se publicó como público. Lo oculto nunca aparece acá."
        actions={
          <Button icon={RefreshCw} onClick={load} disabled={loading} className={loading ? '[&>svg]:animate-spin' : ''}>
            Actualizar
          </Button>
        }
      />

      {error ? (
        <EmptyState icon={AlertCircle} title="No se pudo cargar" description={error} />
      ) : loading && pastes.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : pastes.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Todavía no hay nada público"
          description="Publicá algo con visibilidad Público y va a aparecer acá."
          action={
            <Link to="/" className={buttonClass('primary')}>
              Publicar el primero
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pastes.map((paste) => (
            <Link
              key={paste.id}
              to={`/paste/${paste.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong"
            >
              <div className="flex items-center justify-between gap-3 px-4 pt-4">
                <p className="truncate font-medium group-hover:text-accent">{paste.title || 'Sin título'}</p>
                <LanguageBadge language={paste.language} />
              </div>
              <pre className="relative m-4 h-32 overflow-hidden rounded-lg bg-surface-2 p-3 font-mono text-xs leading-relaxed text-muted">
                {paste.content.split('\n').slice(0, 9).join('\n')}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-2" />
              </pre>
              <div className="flex items-center justify-between px-4 pb-4 text-xs text-muted">
                <span>{timeAgo(paste.createdAt)}</span>
                <span>{paste.isOwner ? 'Tuyo' : paste.author ? `Anónimo #${paste.author.substring(0, 5)}` : 'Anónimo'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
