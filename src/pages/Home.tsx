import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Send, Play, Globe, Link2, Sparkles, Smartphone, Download } from 'lucide-react';
import { pasteService } from '../lib/pasteService';
import { EXPIRIES, Expiry, Language } from '../types';
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

export default function Home() {
  const prefill = (useLocation().state ?? {}) as PrefillState;
  const [content, setContent] = useState(prefill.content ?? '');
  const [title, setTitle] = useState(prefill.title ?? '');
  // Pestle is only for Python.
  const language: Language = 'python';
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
      toast('Código publicado: el enlace está listo para compartir');
      navigate(`/paste/${pasteId}`);
    } catch (err) {
      console.error(err);
      toast(`No se pudo publicar: ${err instanceof Error ? err.message : err}`, 'error');
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
      setContent(content.slice(0, selectionStart) + '    ' + content.slice(selectionEnd));
      requestAnimationFrame(() => el.setSelectionRange(selectionStart + 4, selectionStart + 4));
    }
  };

  const lines = content ? content.split('\n').length : 0;

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Escribí, probá y compartí código Python</h1>
        <p className="text-muted max-w-2xl">
          Escribí o pegá código Python, ejecutalo acá mismo y obtené un enlace para compartirlo. Sin instalar nada y sin crear una cuenta.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden focus-within:border-accent/60 transition-colors">
            <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
              <input
                type="text"
                aria-label="Título"
                placeholder="Sin título"
                maxLength={200}
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] uppercase text-muted">
                Python
              </span>
            </div>
            <textarea
              aria-label="Contenido"
              className="block h-[440px] w-full resize-y bg-surface p-5 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted/70"
              placeholder={'# Escribí tu código Python acá\nprint("¡Hola, mundo!")'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoFocus={!prefill.content}
            />
            <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-2/60 px-4 py-2 text-xs text-muted">
              <span>
                {lines} {lines === 1 ? 'línea' : 'líneas'} · {content.length.toLocaleString('es-AR')} caracteres
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Kbd>Tab</Kbd> sangría · <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> publicar
              </span>
            </div>
          </Card>

          {running ? (
            <CodeRunner code={content} language={language} onClose={() => setRunning(false)} />
          ) : (
            <Button variant="success" icon={Play} disabled={!content.trim()} onClick={() => setRunning(true)}>
              Probar
            </Button>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5 space-y-5 lg:sticky lg:top-24">
            <Field label="Vence" htmlFor="expires">
              <Select id="expires" value={expiresIn} onChange={(e) => setExpiresIn(e.target.value as Expiry)}>
                {EXPIRIES.map((exp) => (
                  <option key={exp.value} value={exp.value}>
                    {exp.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Visibilidad"
              hint={visibility === 'public' ? 'Aparece en Explorar para todo el mundo.' : 'Solo lo ve quien tenga el enlace.'}
            >
              <Segmented<"public" | "unlisted">
                label="Visibilidad"
                value={visibility}
                onChange={setVisibility}
                options={[
                  { value: 'public', label: 'Público', icon: Globe },
                  { value: 'unlisted', label: 'Oculto', icon: Link2 },
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
              Publicar
            </Button>
          </Card>

          {!isNative && (
            <Card className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-success-soft">
                  <Smartphone className="size-5 text-success" aria-hidden />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Pestle para Android</p>
                  <p className="text-muted">Editor, biblioteca, cursos y ejecutor en tu celular. También funciona sin internet.</p>
                </div>
              </div>
              <ApkLink
                className={buttonClass('success', 'md', 'w-full')}
                fallback={<p className="rounded-lg bg-surface-2 px-3 py-2 text-center text-sm text-muted">La app para Android se está generando. Volvé a fijarte en un rato.</p>}
              >
                <Download className="size-4" aria-hidden /> Descargar APK
              </ApkLink>
              <p className="text-xs text-muted">Android 7 o más nuevo. Cuando Android pregunte, permití instalar desde esta fuente.</p>
            </Card>
          )}

          <div className="flex gap-3 rounded-xl border border-line p-4 text-sm text-muted">
            <Sparkles className="size-4 shrink-0 text-accent mt-0.5" aria-hidden />
            <p>
              ¿Estás empezando? Leé la <Link to="/guia" className="text-fg underline underline-offset-2">guía de Python</Link>, hacé
              los <Link to="/cursos" className="text-fg underline underline-offset-2">cursos</Link> o mirá la{' '}
              <Link to="/codes" className="text-fg underline underline-offset-2">biblioteca de ejemplos</Link>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
