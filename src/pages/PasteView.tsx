import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  Code2,
  Copy,
  Check,
  Download,
  Trash2,
  FileText,
  Timer,
  Play,
  GitFork,
  Link2,
  Globe,
  FileQuestion,
  X,
} from 'lucide-react';
import { pasteService, resolveBackend } from '../lib/pasteService';
import { Paste } from '../types';
import { downloadText, formatDate, timeAgo } from '../lib/utils';
import { isRunnable } from '../lib/runnable';
import { detectLanguage } from '../lib/detectLanguage';
import CodeRunner from '../components/CodeRunner';
import CodeBlock from '../components/CodeBlock';
import { Badge, Button, Card, EmptyState, LanguageBadge, Spinner, buttonClass } from '../components/ui';
import { useToast } from '../components/Toast';
import { API_BASE, isNative, shareUrl } from '../lib/platform';
import { copyText } from '../lib/utils';

export default function PasteView() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMock, setIsMock] = useState(true);
  const [running, setRunning] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    resolveBackend().then((b) => setIsMock(b.isMock));
    if (id) {
      setLoading(true);
      pasteService
        .getPaste(id)
        .then(setPaste)
        .catch(() => setPaste(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const deletePaste = async () => {
    if (!paste) return;
    setDeleting(true);
    try {
      await pasteService.deletePaste(paste.id);
      toast('Código eliminado');
      navigate('/dashboard');
    } catch (err) {
      toast(`No se pudo eliminar: ${err instanceof Error ? err.message : err}`, 'error');
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const copyContent = async () => {
    if (!paste) return;
    await copyText(paste.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    const url = shareUrl(`/paste/${paste!.id}`);
    if (isNative) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: paste!.title || 'Código en Pestle', url }).catch(() => {});
      return;
    }
    await copyText(url);
    toast('Enlace copiado');
  };

  const forkPaste = () => {
    if (!paste) return;
    navigate('/nuevo', {
      state: { title: paste.title ? `${paste.title} (copia)` : undefined, content: paste.content, language: paste.language },
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-muted">
        <Spinner />
        <p className="text-sm">Cargando…</p>
      </div>
    );
  }

  if (!paste) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No encontramos este código"
        description="Puede que haya vencido, que su autor lo haya borrado o que el enlace esté mal."
        action={
          <Link to="/nuevo" className={buttonClass('primary')}>
            Crear uno nuevo
          </Link>
        }
      />
    );
  }

  const lines = paste.content.split('\n').length;
  const canRun = isRunnable(paste.language) || isRunnable(detectLanguage(paste.content) ?? '');

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <LanguageBadge language={paste.language} />
          <Badge tone={paste.isPublic ? 'accent' : 'neutral'}>
            {paste.isPublic ? <Globe className="size-3" /> : <Link2 className="size-3" />}
            {paste.isPublic ? 'Público' : 'Oculto'}
          </Badge>
          {paste.expiresAt && (
            <Badge tone="warn">
              <Timer className="size-3" /> Vence {timeAgo(paste.expiresAt)}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">{paste.title || 'Sin título'}</h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5" title={formatDate(paste.createdAt)}>
            <Calendar className="size-4" aria-hidden /> {timeAgo(paste.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="size-4" aria-hidden />
            {paste.isOwner ? 'Vos' : paste.author ? `Anónimo #${paste.author.substring(0, 5)}` : 'Anónimo'}
          </span>
          <span className="flex items-center gap-1.5">
            <Code2 className="size-4" aria-hidden /> {lines} {lines === 1 ? 'línea' : 'líneas'}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Acciones">
        {canRun && (
          <Button variant="success" icon={running ? X : Play} onClick={() => setRunning((r) => !r)}>
            {running ? 'Ocultar resultado' : 'Ejecutar'}
          </Button>
        )}
        <Button icon={Link2} onClick={copyLink}>
          {isNative ? 'Compartir enlace' : 'Copiar enlace'}
        </Button>
        <Button icon={GitFork} onClick={forkPaste}>
          Hacer una copia
        </Button>
        <Button
          icon={Download}
          onClick={() =>
            downloadText(paste.content, paste.title || `paste-${paste.id}`, paste.language)
              .then((where) => where && toast(`Guardado en ${where}`))
              .catch((err) => toast(`No se pudo guardar: ${err instanceof Error ? err.message : err}`, 'error'))
          }
        >
          Descargar
        </Button>
        {!isMock && (
          <a href={`${API_BASE}/api/pastes/${paste.id}?raw=1`} target="_blank" rel="noreferrer" className={buttonClass()}>
            <FileText className="size-4" aria-hidden /> Texto plano
          </a>
        )}
        {paste.isOwner &&
          (confirmingDelete ? (
            <span className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-2 py-1 animate-fade-up">
              <span className="text-sm text-danger px-1">¿Borrarlo para siempre?</span>
              <Button size="sm" variant="danger" loading={deleting} onClick={deletePaste}>
                Sí, borrar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </Button>
            </span>
          ) : (
            <Button variant="danger" icon={Trash2} onClick={() => setConfirmingDelete(true)}>
              Eliminar
            </Button>
          ))}
      </div>

      {running && <CodeRunner code={paste.content} language={paste.language} onClose={() => setRunning(false)} />}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-muted">
          <span className="font-mono">{paste.title || `paste-${paste.id}`}</span>
          <Button size="sm" variant="ghost" icon={copied ? Check : Copy} onClick={copyContent} aria-label="Copiar código">
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-auto">
          <CodeBlock code={paste.content} language={paste.language} />
        </div>
      </Card>
    </div>
  );
}
