import { useEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpenText, CheckCircle2, ChevronRight, Circle, Clock, GraduationCap } from 'lucide-react';
import { GUIDE, GUIDE_PARTS, findChapter } from '../data/guide';
import { markDone, startProgressSync, useCompleted } from '../lib/courseProgress';
import Prose from '../components/Prose';
import { Badge, Button, Card, PageHeader, buttonClass } from '../components/ui';
import { cn } from '../lib/utils';

/** Read chapters are stored with the course progress as "guia/<chapter>", so they sync too. */
export const GUIDE_KEY = 'guia';
const readKey = (id: string) => `${GUIDE_KEY}/${id}`;

/** /guia: the table of contents. */
export function GuideIndex() {
  const done = useCompleted();
  useEffect(() => startProgressSync(), []);
  const read = GUIDE.filter((c) => done.has(readKey(c.id))).length;
  const next = GUIDE.find((c) => !done.has(readKey(c.id))) ?? GUIDE[0];
  const totalMinutes = GUIDE.reduce((n, c) => n + c.minutes, 0);

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        icon={BookOpenText}
        title="Guía de Python"
        description={`Todo lo que necesitás entender de Python, explicado desde cero y para leer a tu ritmo: ${GUIDE.length} capítulos (unos ${Math.round(totalMinutes / 5) * 5} minutos en total) con ejemplos que podés ejecutar.`}
        actions={
          <Link to={`/guia/${next.id}`} className={buttonClass('primary')}>
            {read ? 'Seguir leyendo' : 'Empezar a leer'} <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {read} de {GUIDE.length} capítulos leídos
          </span>
          <span className="text-muted">{Math.round((read / GUIDE.length) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(read / GUIDE.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {GUIDE_PARTS.map((part, p) => (
          <Card key={part} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Parte {p + 1}</p>
            <h2 className="mb-3 text-lg font-semibold">{part}</h2>
            <ol className="space-y-1">
              {GUIDE.filter((c) => c.part === part).map((c) => {
                const isRead = done.has(readKey(c.id));
                return (
                  <li key={c.id}>
                    <Link to={`/guia/${c.id}`} className="group flex gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                      {isRead ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="Leído" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted" aria-label="Sin leer" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium group-hover:text-accent">{c.title}</span>
                        <span className="block text-sm text-muted">{c.summary}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">{c.minutes} min</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Card>
        ))}
        <Card className="flex flex-col justify-center gap-3 border-accent/30 bg-accent-soft p-5">
          <GraduationCap className="size-7 text-accent" aria-hidden />
          <p className="font-semibold">¿Querés practicar lo que leíste?</p>
          <p className="text-sm text-muted">
            Los cursos tienen ejercicios que se corrigen solos, un proyecto final y certificado.
          </p>
          <Link to="/cursos" className={buttonClass('accent', 'md', 'self-start')}>
            Ir a los cursos
          </Link>
        </Card>
      </div>
    </div>
  );
}

/** /guia/:id: one chapter. It counts as read when you reach the end. */
export function GuideChapter() {
  const { chapterId } = useParams();
  const { chapter, index } = findChapter(chapterId);
  const done = useCompleted();
  const endRef = useRef<HTMLDivElement>(null);
  const isRead = chapter ? done.has(readKey(chapter.id)) : false;

  useEffect(() => startProgressSync(), []);

  useEffect(() => {
    if (!chapter || isRead || !endRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) markDone(GUIDE_KEY, chapter.id);
    });
    // Give the reader a moment on the page before counting a short chapter as read.
    const t = setTimeout(() => endRef.current && observer.observe(endRef.current), 4000);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [chapter, isRead]);

  if (!chapter) return <Navigate to="/guia" replace />;
  const prev = GUIDE[index - 1];
  const next = GUIDE[index + 1];

  return (
    <article key={chapter.id} className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted" aria-label="Ruta">
        <Link to="/guia" className="hover:text-fg">
          Guía de Python
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span>{chapter.part}</span>
      </nav>

      <header className="space-y-3 border-b border-line pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            Capítulo {index + 1} de {GUIDE.length}
          </Badge>
          <Badge>
            <Clock className="size-3" /> {chapter.minutes} min de lectura
          </Badge>
          {isRead && (
            <Badge tone="success">
              <CheckCircle2 className="size-3" /> Leído
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{chapter.title}</h1>
        <p className="text-lg text-muted">{chapter.summary}</p>
      </header>

      <div className="text-[1.05rem]">
        <Prose source={chapter.content} />
      </div>

      <div ref={endRef} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4">
        {isRead ? (
          <p className="flex flex-1 items-center gap-2 font-medium text-success">
            <CheckCircle2 className="size-5" aria-hidden /> Capítulo leído
          </p>
        ) : (
          <>
            <p className="flex-1 text-sm text-muted">¿Terminaste de leer?</p>
            <Button variant="success" icon={CheckCircle2} onClick={() => markDone(GUIDE_KEY, chapter.id)}>
              Marcar como leído
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Link to={`/guia/${prev.id}`} className={cn(buttonClass('ghost'), 'min-w-0')}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden /> <span className="truncate">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/guia/${next.id}`} className={cn(buttonClass('secondary'), 'min-w-0')}>
            <span className="truncate">{next.title}</span> <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
        ) : (
          <Link to="/cursos" className={buttonClass('primary')}>
            Practicar en los cursos <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}
