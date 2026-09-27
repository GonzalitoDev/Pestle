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
      toast('Paste deleted');
      navigate('/dashboard');
    } catch (err) {
      toast(`Could not delete: ${err instanceof Error ? err.message : err}`, 'error');
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
      await Share.share({ title: paste!.title || 'Pestle paste', url }).catch(() => {});
      return;
    }
    await copyText(url);
    toast('Link copied to clipboard');
  };

  const forkPaste = () => {
    if (!paste) return;
    navigate('/', {
      state: { title: paste.title ? `${paste.title} (fork)` : undefined, content: paste.content, language: paste.language },
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-muted">
        <Spinner />
        <p className="text-sm">Loading paste…</p>
      </div>
    );
  }

  if (!paste) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Paste not found"
        description="It may have expired, been deleted by its author, or the link is wrong."
        action={
          <Link to="/" className={buttonClass('primary')}>
            Create a new paste
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
            {paste.isPublic ? 'Public' : 'Unlisted'}
          </Badge>
          {paste.expiresAt && (
            <Badge tone="warn">
              <Timer className="size-3" /> Expires {timeAgo(paste.expiresAt)}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">{paste.title || 'Untitled paste'}</h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5" title={formatDate(paste.createdAt)}>
            <Calendar className="size-4" aria-hidden /> {timeAgo(paste.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="size-4" aria-hidden />
            {paste.isOwner ? 'You' : paste.author ? `Anonymous #${paste.author.substring(0, 5)}` : 'Anonymous'}
          </span>
          <span className="flex items-center gap-1.5">
            <Code2 className="size-4" aria-hidden /> {lines} {lines === 1 ? 'line' : 'lines'}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Paste actions">
        {canRun && (
          <Button variant="success" icon={running ? X : Play} onClick={() => setRunning((r) => !r)}>
            {running ? 'Hide output' : 'Run'}
          </Button>
        )}
        <Button icon={Link2} onClick={copyLink}>
          {isNative ? 'Share link' : 'Copy link'}
        </Button>
        <Button icon={GitFork} onClick={forkPaste}>
          Fork
        </Button>
        <Button
          icon={Download}
          onClick={() =>
            downloadText(paste.content, paste.title || `paste-${paste.id}`, paste.language)
              .then((where) => where && toast(`Saved to ${where}`))
              .catch((err) => toast(`Could not save: ${err instanceof Error ? err.message : err}`, 'error'))
          }
        >
          Download
        </Button>
        {!isMock && (
          <a href={`${API_BASE}/api/pastes/${paste.id}?raw=1`} target="_blank" rel="noreferrer" className={buttonClass()}>
            <FileText className="size-4" aria-hidden /> Raw
          </a>
        )}
        {paste.isOwner &&
          (confirmingDelete ? (
            <span className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-2 py-1 animate-fade-up">
              <span className="text-sm text-danger px-1">Delete permanently?</span>
              <Button size="sm" variant="danger" loading={deleting} onClick={deletePaste}>
                Yes, delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </span>
          ) : (
            <Button variant="danger" icon={Trash2} onClick={() => setConfirmingDelete(true)}>
              Delete
            </Button>
          ))}
      </div>

      {running && <CodeRunner code={paste.content} language={paste.language} onClose={() => setRunning(false)} />}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-muted">
          <span className="font-mono">{paste.title || `paste-${paste.id}`}</span>
          <Button size="sm" variant="ghost" icon={copied ? Check : Copy} onClick={copyContent} aria-label="Copy code">
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-auto">
          <CodeBlock code={paste.content} language={paste.language} />
        </div>
      </Card>
    </div>
  );
}
