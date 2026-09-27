import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Send, Play, Globe, Link2, Sparkles, Wand2, Smartphone, Download } from 'lucide-react';
import { pasteService } from '../lib/pasteService';
import { EXPIRIES, Expiry, LANGUAGES, Language } from '../types';
import { isRunnable } from '../data/snippets';
import { detectLanguage } from '../lib/detectLanguage';
import CodeRunner from '../components/CodeRunner';
import { Button, Card, Field, Kbd, Segmented, Select, buttonClass } from '../components/ui';
import { useToast } from '../components/Toast';
import { isNative } from '../lib/platform';
import ApkLink from '../components/ApkLink';

interface PrefillState {
  title?: string;
  content?: string;
  language?: Language;
}

const labelOf = (l: Language) => LANGUAGES.find((o) => o.value === l)?.label ?? l;

export default function Home() {
  const prefill = (useLocation().state ?? {}) as PrefillState;
  const [content, setContent] = useState(prefill.content ?? '');
  const [title, setTitle] = useState(prefill.title ?? '');
  const [language, setLanguage] = useState<Language>(prefill.language ?? 'javascript');
  const [running, setRunning] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public');
  const [expiresIn, setExpiresIn] = useState<Expiry>('never');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handlePublish = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const pasteId = await pasteService.addPaste({
        title: title.trim() || undefined,
        content,
        language,
        isPublic: visibility === 'public',
        expiresIn,
      });
      toast('Paste published — link ready to share');
      navigate(`/paste/${pasteId}`);
    } catch (err) {
      console.error(err);
      toast(`Could not publish: ${err instanceof Error ? err.message : err}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const detected = detectLanguage(content);
  const mismatch =
    detected && detected !== language && !(detected === 'javascript' && language === 'typescript') ? detected : null;

  // Pasting code picks its language automatically, so it is highlighted and run correctly.
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (content.trim()) return;
    const guess = detectLanguage(e.clipboardData.getData('text'));
    if (guess && guess !== language) {
      setLanguage(guess);
      toast(`Detected ${labelOf(guess)}`, 'info');
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
      setContent(content.slice(0, selectionStart) + '  ' + content.slice(selectionEnd));
      requestAnimationFrame(() => el.setSelectionRange(selectionStart + 2, selectionStart + 2));
    }
  };

  const lines = content ? content.split('\n').length : 0;

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Share code in seconds</h1>
        <p className="text-muted max-w-2xl">
          Paste code or text, test it right here, and get a link. No account needed.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden focus-within:border-accent/60 transition-colors">
            <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
              <input
                type="text"
                aria-label="Title"
                placeholder="Untitled paste"
                maxLength={200}
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] uppercase text-muted">
                {labelOf(language)}
              </span>
            </div>
            <textarea
              aria-label="Paste content"
              className="block h-[440px] w-full resize-y bg-surface p-5 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted/70"
              placeholder="Paste your code or text here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoFocus={!prefill.content}
            />
            <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-2/60 px-4 py-2 text-xs text-muted">
              <span>
                {lines} {lines === 1 ? 'line' : 'lines'} · {content.length.toLocaleString()} characters
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Kbd>Tab</Kbd> indent · <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> publish
              </span>
            </div>
          </Card>

          {mismatch && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm animate-fade-up">
              <span className="flex items-center gap-2">
                <Wand2 className="size-4 shrink-0 text-accent" aria-hidden />
                <span>
                  This looks like <strong>{labelOf(mismatch)}</strong>, but the language is set to {labelOf(language)}.
                </span>
              </span>
              <Button size="sm" variant="accent" onClick={() => setLanguage(mismatch)}>
                Switch to {labelOf(mismatch)}
              </Button>
            </div>
          )}

          {isRunnable(language) &&
            (running ? (
              <CodeRunner code={content} language={language} onClose={() => setRunning(false)} />
            ) : (
              <Button variant="success" icon={Play} disabled={!content.trim()} onClick={() => setRunning(true)}>
                Test run
              </Button>
            ))}
        </div>

        <aside className="space-y-4">
          <Card className="p-5 space-y-5 lg:sticky lg:top-24">
            <Field label="Language" htmlFor="language">
              <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Expires" htmlFor="expires">
              <Select id="expires" value={expiresIn} onChange={(e) => setExpiresIn(e.target.value as Expiry)}>
                {EXPIRIES.map((exp) => (
                  <option key={exp.value} value={exp.value}>
                    {exp.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Visibility"
              hint={visibility === 'public' ? 'Listed in Explore for everyone.' : 'Only people with the link can see it.'}
            >
              <Segmented<"public" | "unlisted">
                label="Visibility"
                value={visibility}
                onChange={setVisibility}
                options={[
                  { value: 'public', label: 'Public', icon: Globe },
                  { value: 'unlisted', label: 'Unlisted', icon: Link2 },
                ]}
              />
            </Field>

            <Button
              variant="primary"
              size="lg"
              icon={Send}
              className="w-full"
              loading={loading}
              disabled={!content.trim()}
              onClick={handlePublish}
            >
              Publish paste
            </Button>
          </Card>

          {!isNative && (
            <Card className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-success-soft">
                  <Smartphone className="size-5 text-success" aria-hidden />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Pestle for Android</p>
                  <p className="text-muted">Editor, library and runner on your phone. Works offline too.</p>
                </div>
              </div>
              <ApkLink
                className={buttonClass('success', 'md', 'w-full')}
                fallback={<p className="rounded-lg bg-surface-2 px-3 py-2 text-center text-sm text-muted">The Android app is being built. Check back soon.</p>}
              >
                <Download className="size-4" aria-hidden /> Download APK
              </ApkLink>
              <p className="text-xs text-muted">Android 7 or newer. When Android asks, allow installing from this source.</p>
            </Card>
          )}

          <div className="flex gap-3 rounded-xl border border-line p-4 text-sm text-muted">
            <Sparkles className="size-4 shrink-0 text-accent mt-0.5" aria-hidden />
            <p>
              Need inspiration? The <Link to="/codes" className="text-fg underline underline-offset-2">code library</Link> has
              ready-to-run snippets you can edit and share.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
