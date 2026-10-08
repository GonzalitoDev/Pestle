import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { API_BASE } from '../lib/platform';
import { useProgress } from '../lib/courseProgress';
import Prose from './Prose';
import { Button, Spinner } from './ui';
import { cn } from '../lib/utils';

interface Mensaje {
  rol: 'usuario' | 'ia';
  texto: string;
  error?: boolean;
}

const STORAGE_KEY = 'pestle_ia_chat';

const load = (): Mensaje[] => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

/** Floating assistant: answers Python questions, knowing which lesson you're on. */
export default function PestleIA() {
  const { pathname } = useLocation();
  const progress = useProgress();
  const [open, setOpen] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>(load);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [, section, a, b] = pathname.split('/');
  const enEjercicio = section === 'cursos' && Boolean(a && b) && b !== 'certificado';
  // The code the person wrote in this exercise, so "¿qué tiene mal mi código?" works.
  const codigo = enEjercicio ? progress.code[`${a}/${b}`]?.v ?? '' : '';

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes.slice(-30)));
    } catch {
      // ignore
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [mensajes]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const enviar = async (pregunta: string) => {
    const limpia = pregunta.trim();
    if (!limpia || pensando) return;
    const historial: Mensaje[] = [...mensajes.filter((m) => !m.error), { rol: 'usuario', texto: limpia }];
    setMensajes([...historial, { rol: 'ia', texto: '' }]);
    setTexto('');
    setPensando(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const actualizar = (fn: (anterior: string) => string, error = false) =>
      setMensajes((ms) => {
        const copia = [...ms];
        copia[copia.length - 1] = { rol: 'ia', texto: fn(copia[copia.length - 1].texto), error };
        return copia;
      });
    try {
      const res = await fetch(`${API_BASE}/api/ia`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mensajes: historial.map(({ rol, texto }) => ({ rol, texto })), pagina: pathname, codigo }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        actualizar(() => data.error || 'No pude responder. Probá de nuevo en un rato.', true);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        actualizar((t) => t + chunk);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') actualizar(() => 'Se cortó la conexión. Probá de nuevo.', true);
    } finally {
      setPensando(false);
      abortRef.current = null;
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void enviar(texto);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void enviar(texto);
    }
  };

  const nuevaConversacion = () => {
    abortRef.current?.abort();
    setMensajes([]);
    setPensando(false);
  };

  const sugerencias = enEjercicio
    ? ['No entiendo el ejercicio, ¿me explicás?', '¿Qué tiene mal mi código?', 'Dame una pista']
    : ['¿Qué es una variable?', '¿Para qué sirve un bucle for?', '¿Qué significa IndentationError?'];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[90] flex h-12 items-center gap-2 rounded-full bg-fg px-4 font-medium text-bg shadow-lg transition-transform hover:scale-105 print:hidden"
          aria-label="Abrir Pestle IA: preguntale tus dudas de Python"
        >
          <Sparkles className="size-5" aria-hidden />
          <span className="hidden sm:inline">Pestle IA</span>
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Pestle IA"
          className="fixed inset-x-3 bottom-3 top-20 z-[90] flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-fade-up sm:inset-x-auto sm:right-5 sm:top-auto sm:h-[min(620px,calc(100vh-7rem))] sm:w-[420px] print:hidden"
        >
          <header className="flex items-center gap-2 border-b border-line px-4 py-3">
            <Sparkles className="size-5 text-accent" aria-hidden />
            <p className="flex-1 font-semibold">
              Pestle IA{' '}
              <span className="ml-1 rounded bg-warn-soft px-1 py-0.5 align-middle text-[10px] font-semibold uppercase text-warn">
                Beta
              </span>
            </p>
            {mensajes.length > 0 && (
              <button
                onClick={nuevaConversacion}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
                title="Nueva conversación"
                aria-label="Nueva conversación"
              >
                <RotateCcw className="size-4" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Cerrar Pestle IA"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {mensajes.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted">
                  Preguntame lo que quieras de Python: qué significa un error, cómo funciona algo o por qué tu código no anda.
                  {enEjercicio && ' Ya sé en qué ejercicio estás y veo el código que escribiste.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sugerencias.map((s) => (
                    <button
                      key={s}
                      onClick={() => void enviar(s)}
                      className="rounded-full border border-line px-3 py-1.5 text-left text-sm hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              mensajes.map((m, i) =>
                m.rol === 'usuario' ? (
                  <div key={i} className="ml-8 whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent-soft px-3.5 py-2.5 text-sm">
                    {m.texto}
                  </div>
                ) : (
                  <div key={i} className={cn('text-sm', m.error && 'rounded-lg bg-danger-soft px-3 py-2 text-danger')}>
                    {m.texto ? (
                      m.error ? m.texto : <Prose source={m.texto} />
                    ) : (
                      <span className="flex items-center gap-2 text-muted">
                        <Spinner className="size-4" /> Pensando…
                      </span>
                    )}
                  </div>
                )
              )
            )}
          </div>

          <form onSubmit={submit} className="border-t border-line p-3">
            <div className="flex items-end gap-2">
              <label htmlFor="pregunta-ia" className="sr-only">
                Tu pregunta
              </label>
              <textarea
                id="pregunta-ia"
                ref={inputRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={onKeyDown}
                rows={Math.min(5, Math.max(1, texto.split('\n').length))}
                maxLength={4000}
                placeholder="Escribí tu duda…"
                className="max-h-40 min-h-10 flex-1 resize-none rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <Button type="submit" variant="primary" size="md" icon={Send} disabled={!texto.trim() || pensando} aria-label="Enviar">
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Puede equivocarse: probá el código antes de confiar. No compartas datos personales.
            </p>
          </form>
        </section>
      )}
    </>
  );
}
