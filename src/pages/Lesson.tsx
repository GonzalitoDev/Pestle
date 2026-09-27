import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Eye, Lightbulb, ListChecks, Play, RotateCcw, Sparkles } from 'lucide-react';
import { COURSES, findLesson } from '../data/courses';
import { markDone, setLastVisited, startProgressSync, useCompleted, useLessonCode } from '../lib/courseProgress';
import { PASS_MARKER, buildCheckProgram, buildRunProgram } from '../lib/pythonCheck';
import CodeRunner, { LogLine } from '../components/CodeRunner';
import CodeBlock from '../components/CodeBlock';
import Prose from '../components/Prose';
import { Badge, Button, Card, buttonClass } from '../components/ui';
import { useToast } from '../components/Toast';
import SaveStatus from '../components/SaveStatus';
import { cn } from '../lib/utils';

type RunMode = 'run' | 'check';

export default function Lesson() {
  const { courseId, lessonId } = useParams();
  const { course, lesson, index } = findLesson(courseId, lessonId);

  if (!course) return <Navigate to="/cursos" replace />;
  if (!lesson) return <Navigate to={`/cursos/${course.id}/${course.lessons[0].id}`} replace />;
  // Remount per lesson so the editor, output and state start fresh.
  return <LessonView key={`${course.id}/${lesson.id}`} courseId={course.id} index={index} />;
}

function LessonView({ courseId, index }: { courseId: string; index: number }) {
  const course = COURSES.find((c) => c.id === courseId)!;
  const lesson = course.lessons[index];
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const done = useCompleted();
  const toast = useToast();
  const isDone = done.has(`${course.id}/${lesson.id}`);
  const completedCount = course.lessons.filter((l) => done.has(`${course.id}/${l.id}`)).length;

  const [code, setCode] = useLessonCode(course.id, lesson.id, lesson.starter);
  const [run, setRun] = useState<{ mode: RunMode; id: number; program: string } | null>(null);
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const passedRef = useRef(false);

  useEffect(() => {
    startProgressSync();
    setLastVisited(`/cursos/${course.id}/${lesson.id}`);
  }, [course.id, lesson.id]);

  const execute = (mode: RunMode) => {
    passedRef.current = false;
    setResult(null);
    setRun((r) => ({
      mode,
      id: (r?.id ?? 0) + 1,
      program: mode === 'check' ? buildCheckProgram(code, lesson.tests) : buildRunProgram(code),
    }));
  };

  const onLog = (line: LogLine) => {
    if (run?.mode !== 'check') return;
    if (line.text.includes(PASS_MARKER) && !passedRef.current) {
      passedRef.current = true;
      setResult('pass');
      if (!isDone) {
        markDone(course.id, lesson.id);
        toast(next ? '¡Lección completada! Seguí con la próxima.' : '¡Terminaste todas las lecciones! Ahora, el proyecto final 🎉');
      }
    } else if (line.text.startsWith('❌') || line.type === 'error') {
      setResult((r) => r ?? 'fail');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      execute(e.shiftKey ? 'run' : 'check');
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart, selectionEnd } = el;
      setCode(code.slice(0, selectionStart) + '    ' + code.slice(selectionEnd));
      requestAnimationFrame(() => el.setSelectionRange(selectionStart + 4, selectionStart + 4));
    }
  };

  const lines = code.split('\n').length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Course header */}
      <div className="space-y-3">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted" aria-label="Ruta">
          <Link to="/cursos" className="hover:text-fg">
            Cursos
          </Link>
          <ChevronRight className="size-4" aria-hidden />
          <span className="text-fg">{course.title}</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${(completedCount / course.lessons.length) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted">
            {completedCount}/{course.lessons.length} completadas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Lesson */}
        <article className="min-w-0 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>
                Lección {index + 1} de {course.lessons.length}
              </Badge>
              {isDone && (
                <Badge tone="success">
                  <CheckCircle2 className="size-3" /> Completada
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{lesson.title}</h1>
          </div>

          <Prose source={lesson.content} />

          <details className="rounded-xl border border-line bg-surface p-4">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <ListChecks className="size-4 text-muted" aria-hidden /> Todas las lecciones
            </summary>
            <ol className="mt-3 space-y-0.5 text-sm">
              {course.lessons.map((l, i) => (
                <li key={l.id}>
                  <Link
                    to={`/cursos/${course.id}/${l.id}`}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-2',
                      i === index && 'bg-surface-2 font-medium'
                    )}
                  >
                    {done.has(`${course.id}/${l.id}`) ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completada" />
                    ) : (
                      <span className="grid size-4 shrink-0 place-items-center text-[10px] text-muted">{i + 1}</span>
                    )}
                    {l.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={`/cursos/${course.id}/proyecto`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-surface-2"
                >
                  {done.has(`${course.id}/proyecto`) ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completado" />
                  ) : (
                    <Sparkles className="size-4 shrink-0 text-accent" aria-hidden />
                  )}
                  Proyecto final: {course.project.title}
                </Link>
              </li>
            </ol>
          </details>
        </article>

        {/* Exercise */}
        <section className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Ejercicio">
          <Card className="overflow-hidden">
            <div className="space-y-2 border-b border-line p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Ejercicio</p>
              <p className="text-sm leading-relaxed">{lesson.exercise}</p>
              {lesson.hint && (
                <details className="text-sm text-muted">
                  <summary className="flex cursor-pointer items-center gap-1.5 hover:text-fg">
                    <Lightbulb className="size-4" aria-hidden /> Ver una pista
                  </summary>
                  <p className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-fg">{lesson.hint}</p>
                </details>
              )}
            </div>
            <textarea
              aria-label="Tu código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              rows={Math.min(Math.max(lines + 2, 10), 22)}
              className="block w-full resize-y bg-surface p-4 font-mono text-[13px] leading-relaxed outline-none"
            />
            <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2/60 p-3">
              <Button variant="primary" icon={CheckCircle2} onClick={() => execute('check')}>
                Comprobar
              </Button>
              <Button icon={Play} onClick={() => execute('run')}>
                Ejecutar
              </Button>
              <Button variant="ghost" icon={Eye} onClick={() => setShowSolution((s) => !s)}>
                {showSolution ? 'Ocultar solución' : 'Ver solución'}
              </Button>
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={() => {
                  setCode(lesson.starter);
                  setRun(null);
                  setResult(null);
                }}
                title="Volver al código inicial"
              >
                Reiniciar
              </Button>
              <span className="ml-auto">
                <SaveStatus />
              </span>
            </div>
          </Card>

          {result === 'pass' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3 animate-fade-up">
              <p className="flex items-center gap-2 font-medium text-success">
                <CheckCircle2 className="size-5" aria-hidden /> ¡Muy bien! Ejercicio resuelto.
              </p>
              {next ? (
                <Link to={`/cursos/${course.id}/${next.id}`} className={buttonClass('success', 'sm')}>
                  Siguiente lección <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <Link to={`/cursos/${course.id}/proyecto`} className={buttonClass('success', 'sm')}>
                  Ir al proyecto final <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
          )}

          {run && (
            <CodeRunner
              key={run.id}
              code={run.program}
              language="python"
              onLog={onLog}
              onClose={() => setRun(null)}
            />
          )}

          {showSolution && (
            <Card className="overflow-hidden animate-fade-up">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <p className="text-sm font-medium">Una solución posible</p>
                <Button size="sm" variant="ghost" onClick={() => setCode(lesson.solution)}>
                  Copiar al editor
                </Button>
              </div>
              <div className="overflow-x-auto">
                <CodeBlock code={lesson.solution.trimEnd()} language="python" />
              </div>
            </Card>
          )}
        </section>
      </div>

      {/* Prev / next */}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Link to={`/cursos/${course.id}/${prev.id}`} className={buttonClass('ghost')}>
            <ArrowLeft className="size-4" aria-hidden /> <span className="truncate">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/cursos/${course.id}/${next.id}`} className={buttonClass('secondary')}>
            <span className="truncate">{next.title}</span> <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Link to={`/cursos/${course.id}/proyecto`} className={buttonClass('secondary')}>
            Proyecto final <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
