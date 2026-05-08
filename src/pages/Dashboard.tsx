import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { FileCode, Clock, Eye, Lock, Terminal, ShieldAlert } from 'lucide-react';
import { pasteService } from '../lib/pasteService';
import { Paste } from '../types';
import { formatDate } from '../lib/utils';

interface DashboardProps {
  user: FirebaseUser | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      pasteService.getUserPastes(user.uid).then(res => {
        setPastes(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse pt-10">
        <div className="h-12 bg-[#141414]/10 w-64 rounded-sm" />
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-[#141414]/5 border border-[#141414]/10 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <ShieldAlert size={64} strokeWidth={1} className="opacity-20" />
        <div className="text-center space-y-2">
          <h2 className="font-mono text-xl font-bold uppercase tracking-tight">ACCESS_DENIED</h2>
          <p className="font-mono text-xs opacity-40 uppercase tracking-widest">Authentication required for vault access.</p>
        </div>
        <p className="text-[10px] font-mono max-w-xs text-center opacity-40 uppercase leading-relaxed">
          Please authenticate with your operator credentials to view your stored data signatures.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-mono font-bold tracking-tighter uppercase underline decoration-[#141414]/20 underline-offset-8 decoration-4">MY_SIGNAL_VAULT</h1>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">Stored historical data assets for user_{user.uid.substring(0, 8)}</p>
      </header>

      {pastes.length === 0 ? (
        <div className="border border-dashed border-[#141414]/30 p-20 text-center space-y-4 bg-white/50">
          <Terminal size={32} className="mx-auto opacity-20" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest opacity-40">VAULT_EMPTY</p>
          <Link to="/" className="inline-block px-8 py-2 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest hover:opacity-90 transition-all active:scale-95">
            GENERATE_FIRST_SIGNAL
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1 border-y border-[#141414]">
          {pastes.map((paste) => (
            <Link 
              key={paste.id} 
              to={`/paste/${paste.id}`}
              className="group grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-5 bg-[#E4E3E0] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all cursor-pointer border-b border-[#141414]/10 last:border-b-0"
            >
              <div className="md:col-span-1 flex justify-center">
                <FileCode size={20} className="group-hover:rotate-12 transition-transform" />
              </div>
              
              <div className="md:col-span-5 space-y-1">
                <p className="font-mono font-bold text-sm tracking-tight group-hover:underline underline-offset-4">
                  {paste.title || 'UNTITLED_RECORD'}
                </p>
                <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest opacity-50 group-hover:opacity-80">
                  <span className="flex items-center gap-1.5"><Clock size={10} /> {formatDate(paste.createdAt)}</span>
                </div>
              </div>

              <div className="md:col-span-3 flex items-center gap-2">
                <span className="px-2 py-0.5 border border-[#141414]/20 group-hover:border-[#E4E3E0]/40 text-[9px] font-mono font-bold uppercase">
                  {paste.language}
                </span>
                {paste.isPublic ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono opacity-40 group-hover:opacity-100"><Eye size={10} /> PUBLIC</span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-mono opacity-40 group-hover:opacity-100"><Lock size={10} /> UNLISTED</span>
                )}
              </div>

              <div className="md:col-span-3 flex justify-end">
                <p className="text-[10px] font-mono opacity-30 group-hover:opacity-100 tracking-tighter">
                  SIG_{paste.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-10 opacity-30 text-[9px] font-mono uppercase tracking-widest">
        <p>TOTAL_ENTRIES: {pastes.length}</p>
        <p className="flex items-center gap-2">STORAGE_STATUS: NOMINAL <div className="w-1.5 h-1.5 rounded-full bg-green-500" /></p>
      </div>
    </div>
  );
}
