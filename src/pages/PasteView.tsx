import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, User, Code2, Copy, Check, Download, Share2, Trash2, FileText, Timer } from 'lucide-react';
import { pasteService, resolveBackend } from '../lib/pasteService';
import { Paste } from '../types';
import { formatDate } from '../lib/utils';

export default function PasteView() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMock, setIsMock] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    resolveBackend().then(b => setIsMock(b.isMock));
    if (id) {
      pasteService.getPaste(id)
        .then(setPaste)
        .catch(() => setPaste(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const deletePaste = async () => {
    if (!paste || !confirm('Purge this paste permanently?')) return;
    try {
      await pasteService.deletePaste(paste.id);
      navigate('/dashboard');
    } catch (err) {
      alert(`Failed to delete paste: ${err instanceof Error ? err.message : err}`);
    }
  };

  const copyToClipboard = () => {
    if (paste) {
      navigator.clipboard.writeText(paste.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPaste = () => {
    if (paste) {
      const blob = new Blob([paste.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paste.title || 'snippet'}.${paste.language}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest">RETRIEVING_DATA_STREAM...</p>
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <h2 className="text-6xl font-mono font-bold opacity-10">404_</h2>
        <div className="text-center space-y-2">
          <p className="font-mono text-sm uppercase tracking-widest font-bold">DATA_NOT_FOUND</p>
          <p className="font-mono text-[10px] opacity-40 uppercase">The requested resource has been purged or never existed.</p>
        </div>
        <Link to="/" className="px-6 py-2 border border-[#141414] text-[10px] font-mono uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors">
          RETURN_TO_ROOT
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#141414] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#141414] text-[#E4E3E0] text-[9px] font-mono font-bold uppercase tracking-widest">
              {paste.language}
            </span>
            <span className="text-[9px] font-mono font-bold opacity-40 uppercase tracking-widest">
              ID: {id}
            </span>
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tight uppercase underline decoration-2 underline-offset-8">
            {paste.title || 'UNTITLED_RECORD'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono opacity-50 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(paste.createdAt)}</div>
            <div className="flex items-center gap-1.5"><User size={12} /> {paste.isOwner ? 'YOU' : paste.author ? `OPERATOR_${paste.author.substring(0, 5).toUpperCase()}` : 'ANONYMOUS_SIGNAL'}</div>
            <div className="flex items-center gap-1.5"><Code2 size={12} /> {paste.content.split('\n').length} LINES</div>
            {paste.expiresAt && (
              <div className="flex items-center gap-1.5"><Timer size={12} /> EXPIRES {formatDate(paste.expiresAt)}</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isMock && (
            <a
              href={`/api/pastes/${paste.id}?raw=1`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-[#141414] bg-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all active:scale-95"
            >
              <FileText size={14} />
              RAW
            </a>
          )}
          {paste.isOwner && (
            <button
              onClick={deletePaste}
              className="flex items-center gap-2 px-4 py-2 border border-red-700 bg-white text-red-700 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-red-700 hover:text-white transition-all active:scale-95"
            >
              <Trash2 size={14} />
              PURGE
            </button>
          )}
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 border border-[#141414] bg-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'COPIED' : 'COPY_RAW'}
          </button>
          <button 
            onClick={downloadPaste}
            className="flex items-center gap-2 px-4 py-2 border border-[#141414] bg-[#141414] text-[#E4E3E0] text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
          >
            <Download size={14} />
            DOWNLOAD
          </button>
        </div>
      </header>

      <div className="border border-[#141414] bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <SyntaxHighlighter
          language={paste.language}
          style={vs}
          customStyle={{
            margin: 0,
            padding: '2rem',
            background: 'white',
            fontSize: '13px',
            lineHeight: '1.6',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          showLineNumbers={true}
          lineNumberStyle={{ opacity: 0.2, minWidth: '3em', paddingRight: '1em' }}
        >
          {paste.content}
        </SyntaxHighlighter>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="border-l-2 border-[#141414] pl-6 py-2 space-y-2">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
            <Share2 size={12} /> ACCESS_URL
          </p>
          <code className="text-xs font-mono bg-white p-2 border border-[#141414]/10 block truncate">
            {window.location.href}
          </code>
        </div>
        <div className="text-right flex flex-col justify-center opacity-30 text-[9px] font-mono uppercase tracking-[0.3em] leading-loose">
          <p>DATA_INTEGRITY: VERIFIED</p>
          <p>TRANSPORT_PROTOCOL: ENCRYPTED</p>
          <p>TTL: {paste.expiresAt ? formatDate(paste.expiresAt).toUpperCase() : 'INDEFINITE'}</p>
        </div>
      </div>
    </div>
  );
}
