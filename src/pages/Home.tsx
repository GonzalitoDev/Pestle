import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, FileCode, Clock, ShieldCheck, Play } from 'lucide-react';
import { pasteService } from '../lib/pasteService';
import { EXPIRIES, Expiry, LANGUAGES, Language } from '../types';
import { cn } from '../lib/utils';
import { isRunnable } from '../data/snippets';
import CodeRunner from '../components/CodeRunner';

interface PrefillState {
  title?: string;
  content?: string;
  language?: Language;
}

export default function Home() {
  const prefill = (useLocation().state ?? {}) as PrefillState;
  const [content, setContent] = useState(prefill.content ?? '');
  const [title, setTitle] = useState(prefill.title ?? '');
  const [language, setLanguage] = useState<Language>(prefill.language ?? 'javascript');
  const [running, setRunning] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [expiresIn, setExpiresIn] = useState<Expiry>('never');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePublish = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const pasteId = await pasteService.addPaste({
        title: title.trim() || undefined,
        content,
        language,
        isPublic,
        expiresIn,
      });
      navigate(`/paste/${pasteId}`);
    } catch (err) {
      console.error(err);
      alert(`Failed to publish paste: ${err instanceof Error ? err.message : err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePublish();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart, selectionEnd } = el;
      const next = content.slice(0, selectionStart) + '  ' + content.slice(selectionEnd);
      setContent(next);
      requestAnimationFrame(() => el.setSelectionRange(selectionStart + 2, selectionStart + 2));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-mono font-bold tracking-tighter">INITIALIZE_BUFFER</h1>
        <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-40">Load source data into shared transient memory</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-[#141414] bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="border-b border-[#141414] px-4 py-2 flex items-center justify-between bg-[#f8f8f7]">
              <input 
                type="text" 
                placeholder="UNTITLED_SNIPPET"
                className="bg-transparent border-none outline-none font-mono font-bold text-sm w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase">LIVE</span>
              </div>
            </div>
            <textarea
              className="w-full h-[500px] p-6 font-mono text-sm leading-relaxed outline-none resize-none bg-white placeholder:opacity-20"
              placeholder="// Paste your code or text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
            />
            <div className="border-t border-[#141414] px-4 py-2 flex items-center justify-between bg-[#f8f8f7] text-[10px] font-mono uppercase opacity-70">
              <span>{content ? content.split('\n').length : 0} LINES · {content.length} CHARS</span>
              <span className="hidden sm:inline">CTRL+ENTER TO TRANSMIT · TAB INDENTS</span>
            </div>
          </div>

          {isRunnable(language) && (
            running ? (
              <CodeRunner code={content} language={language} onClose={() => setRunning(false)} />
            ) : (
              <button
                disabled={!content.trim()}
                onClick={() => setRunning(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#141414] bg-green-100 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play size={14} /> TEST_RUN_BEFORE_SHARING
              </button>
            )
          )}
        </div>

        {/* Configuration Sidebar */}
        <div className="space-y-6">
          <section className="border border-[#141414] p-5 bg-[#E4E3E0] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] space-y-4">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest border-b border-[#141414]/10 pb-2">CONFIGURATION</h2>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase opacity-50">SYNTAX_MODE</label>
                <div className="relative group">
                  <select 
                    className="w-full bg-white border border-[#141414] px-3 py-2 text-xs font-mono appearance-none outline-none focus:ring-1 focus:ring-black cursor-pointer"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label.toUpperCase()}</option>
                    ))}
                  </select>
                  <FileCode size={14} className="absolute right-3 top-2.5 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase opacity-50">EXPIRATION</label>
                <div className="relative group">
                  <select
                    className="w-full bg-white border border-[#141414] px-3 py-2 text-xs font-mono appearance-none outline-none focus:ring-1 focus:ring-black cursor-pointer"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value as Expiry)}
                  >
                    {EXPIRIES.map(exp => (
                      <option key={exp.value} value={exp.value}>{exp.label.toUpperCase()}</option>
                    ))}
                  </select>
                  <Clock size={14} className="absolute right-3 top-2.5 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase opacity-50">VISIBILITY</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsPublic(true)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-mono uppercase tracking-tighter border transition-all",
                      isPublic ? "bg-[#141414] text-[#E4E3E0] border-[#141414]" : "bg-white border-[#141414]/20 hover:border-[#141414]"
                    )}
                  >
                    PUBLIC
                  </button>
                  <button 
                    onClick={() => setIsPublic(false)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-mono uppercase tracking-tighter border transition-all",
                      !isPublic ? "bg-[#141414] text-[#E4E3E0] border-[#141414]" : "bg-white border-[#141414]/20 hover:border-[#141414]"
                    )}
                  >
                    UNLISTED
                  </button>
                </div>
              </div>
            </div>

            <button 
              disabled={loading || !content.trim()}
              onClick={handlePublish}
              className="w-full bg-[#141414] text-[#E4E3E0] py-3 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#E4E3E0] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  <span className="font-mono text-xs font-bold tracking-widest uppercase">TRANSMIT_DATA</span>
                </>
              )}
            </button>
          </section>

          <section className="text-[10px] font-mono space-y-3 opacity-60 leading-relaxed uppercase">
            <div className="flex gap-2">
              <ShieldCheck size={14} className="shrink-0" />
              <p>End-to-end transport is encrypted via TLS proxy. Data at rest is isolated by domain.</p>
            </div>
            <div className="flex gap-2">
              <Clock size={14} className="shrink-0" />
              <p>Volatile storage: data remains active until its expiration window closes or it is purged by its operator.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
