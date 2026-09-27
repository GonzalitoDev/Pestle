import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Globe, RefreshCw, Terminal } from 'lucide-react';
import { pasteService } from '../lib/pasteService';
import { Paste } from '../types';
import { formatDate } from '../lib/utils';

export default function Explore() {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    pasteService
      .getPublicPastes()
      .then(setPastes)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-mono font-bold tracking-tighter flex items-center gap-3">
            <Globe size={28} /> PUBLIC_FEED
          </h1>
          <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-40">
            Latest public pastes · unlisted pastes never appear here
          </p>
        </div>
        <button
          onClick={load}
          className="self-start flex items-center gap-2 px-4 py-2 border border-[#141414] bg-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all active:scale-95"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> REFRESH
        </button>
      </header>

      {error ? (
        <p className="border border-red-700 bg-red-50 text-red-800 p-4 font-mono text-xs">{error}</p>
      ) : loading && pastes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-[#141414]/5 border border-[#141414]/10" />
          ))}
        </div>
      ) : pastes.length === 0 ? (
        <div className="border border-dashed border-[#141414]/30 p-20 text-center space-y-4 bg-white/50">
          <Terminal size={32} className="mx-auto opacity-20" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest opacity-40">NO_PUBLIC_SIGNALS_YET</p>
          <Link
            to="/"
            className="inline-block px-8 py-2 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest hover:opacity-90"
          >
            PUBLISH_THE_FIRST_ONE
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastes.map((paste) => (
            <Link
              key={paste.id}
              to={`/paste/${paste.id}`}
              className="group border border-[#141414] bg-white hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div className="px-4 py-3 border-b border-[#141414] flex items-center justify-between gap-2 bg-[#f8f8f7]">
                <p className="font-mono font-bold text-sm truncate group-hover:underline underline-offset-4">
                  {paste.title || 'UNTITLED_RECORD'}
                </p>
                <span className="shrink-0 px-2 py-0.5 bg-[#141414] text-[#E4E3E0] text-[9px] font-mono font-bold uppercase">
                  {paste.language}
                </span>
              </div>
              <pre className="p-4 font-mono text-[11px] leading-relaxed overflow-hidden h-32 opacity-80 whitespace-pre">
                {paste.content.split('\n').slice(0, 8).join('\n')}
              </pre>
              <div className="px-4 py-2 border-t border-[#141414]/10 flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest opacity-50">
                <span className="flex items-center gap-1.5">
                  <Clock size={10} /> {formatDate(paste.createdAt)}
                </span>
                <span>{paste.isOwner ? 'BY_YOU' : paste.author ? `OPERATOR_${paste.author.substring(0, 5).toUpperCase()}` : 'ANONYMOUS'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
