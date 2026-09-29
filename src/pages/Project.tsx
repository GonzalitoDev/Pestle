import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Circle,
  Eye,
  Lock,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { COURSES } from '../data/courses';
import { markDone, setLastVisited, startProgressSync, useCompleted, useLessonCode } from '../lib/courseProgress';
import { CONCEPT_LABELS, MARK, REVIEW_DONE, buildProjectProgram, buildRunProgram } from '../lib/pythonCheck';
import { pasteService } from '../lib/pasteService';
import CodeRunner, { LogLine } from '../components/CodeRunner';
import CodeBlock from '../components/CodeBlock';
import Prose from '../components/Prose';
import { Badge, Button, Card, buttonClass } from '../components/ui';
import { useToast } from '../components/Toast';
import SaveStatus from '../components/SaveStatus';
import { cn } from '../lib/utils';

export const PROJECT_ID = 'proyecto';

type ReqStatus = { ok: boolean; message?: string };

export default function Project() {
  const { courseId } = useParams();
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return <Navigate to="/cursos" replace />;
  return <ProjectView key={course.id} courseId={course.id} />;
}

function ProjectView({ courseId }: { courseId: string }) {
  const course = COURSES.find((c) => c.id === courseId)!;
  const project = course.project;
  const done = useCompleted();
  const toast = useToast();
  const navigate = useNavigate();

  const lessonsDone = course.lessons.filter((l) => done.has(`${course.id}/${l.id}`)).length;
  const unlocked = lessonsDone === course.lessons.length;
  const projectDone = done.has(`${course.id}/${PROJECT_ID}`);
  const nextLesson = course.lessons.find((l) => !done.has(`${course.id}/${l.id}`));

  const [code, setCode] = useLessonCode(course.id, PROJECT_ID, project.starter);
  const [run, setRun] = useState<{ id: number; program: string; mode: 'check' | 'run' } | null>(null);
  const [status, setStatus] = useState<Record<string, ReqStatus>>({});
  const [concepts, setConcepts] = useState<string[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    startProgressSync();
    setLastVisited(`/cursos/${course.id}/${PROJECT_ID}`);
  }, [course.id]);

  const passed = project.requirements.filter((r) => status[r.id]?.ok).length;
  const allPassed = passed === project.requirements.length;

  const execute = (mode: 'check' | 'run') => {
    if (mode === 'check') {
      setStatus({});
      setConcepts(null);
      setChecking(true);
    }
    setRun((r) => ({
      id: (r?.id ?? 0) + 1,
      mode,
      program: mode === 'check' ? buildProjectProgram(code, project.requirements, project.setup) : buildRunProgram(code),
    }));
  };

  const onLog = (line: LogLine) => {
    const text = line.text;
    if (text.startsWith(MARK.req)) {
      const [id, result, ...rest] = text.slice(MARK.req.length).split('§');
      setStatus((s) => ({ ...s, [id]: { ok: result === 'OK', message: rest.join('§') } }));
    } else if (text.startsWith(MARK.concepts)) {
      try {
        setConcepts(JSON.parse(text.slice(MARK.concepts.length)));
      } catch {
        setConcepts([]);
      }
    } else if (text === REVIEW_DONE || line.type === 'error') {
      setChecking(false);
    }
  };

  // Celebrate once every requirement passes.
  useEffect(() => {
    if (!checking && run?.mode === 'check' && allPassed && !projectDone) {
      markDone(course.id, PROJECT_ID);
      toast('¡Proyecto terminado! Completaste el curso 🎓');
    }
  }, [checking, allPassed, projectDone, run?.mode, course.id, toast]);

  const publish = async () => {
    setPublishing(true);
    try {
      const id = await pasteService.addPaste({
        title: `Mi proyecto: ${project.title}`,
        content: code,
        language: 'python',
        isPublic: true,
        expiresIn: 'never',
      });
      toast('Proyecto publicado');
      navigate(`/paste/${id}`);
    } catch (err) {
      toast(`No se pudo publicar: ${err instanceof Error ? err.message : err}`, 'error');
      setPublishing(false);
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

  return (
    <div className="space-y-6 animate-fade-up">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted" aria-label="Ruta">
        <Link to="/cursos" className="hover:text-fg">
          Cursos
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <Link to={`/cursos/${course.id}/${course.lessons[0].id}`} className="hover:text-fg">
          {course.title}
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="text-fg">Proyecto final</span>
      </nav>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">
            <Sparkles className="size-3" /> Proyecto final
          </Badge>
          {projectDone && (
            <Badge tone="success">
              <CheckCircle2 className="size-3" /> Terminado
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{project.title}</h1>
      </header>

      {!unlocked ? (
        <Card className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-2">
              <Lock className="size-6 text-muted" aria-hidden />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Se desbloquea al terminar el curso</h2>
              <p className="text-muted">
                Completaste {lessonsDone} de {course.lessons.length} lecciones. Terminá las que faltan para hacer tu
                proyecto final con todo lo que aprendiste.
              </p>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${(lessonsDone / course.lessons.length) * 100}%` }}
            />
          </div>
          {nextLesson && (
            <Link to={`/cursos/${course.id}/${nextLesson.id}`} className={buttonClass('primary')}>
              Seguir con: {nextLesson.title} <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-sm font-medium">Lo que vas a construir:</p>
            <ul className="space-y-1.5 text-sm text-muted">
              {project.requirements.map((r) => (
                <li key={r.id} className="flex gap-2">
                  <Circle className="mt-0.5 size-4 shrink-0" aria-hidden /> {r.text}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ) : (
        <>
          {projectDone && (
            <div className="flex flex-col gap-4 rounded-2xl border border-success/30 bg-success-soft p-5 sm:flex-row sm:items-center animate-fade-up">
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-success text-bg">
                <Award className="size-7" aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">¡Felicitaciones! Completaste “{course.title}”.</p>
                <p className="text-sm text-muted">
                  Terminaste las {course.lessons.length} lecciones y el proyecto final. Obtené tu certificado con tu nombre,
                  verificable con un código y un QR.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/cursos/${course.id}/certificado`} className={buttonClass('primary')}>
                  <Award className="size-4" aria-hidden /> Obtener mi certificado
                </Link>
                <Button icon={Send} loading={publishing} onClick={publish}>
                  Publicar mi proyecto
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="min-w-0 space-y-5">
              <Prose source={project.intro} />

              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Requisitos</h2>
                  <span className="text-sm text-muted">
                    {passed}/{project.requirements.length}
                  </span>
                </div>
                <ul className="space-y-3" aria-live="polite">
                  {project.requirements.map((r) => {
                    const s = status[r.id];
                    return (
                      <li key={r.id} className="flex gap-2.5 text-sm">
                        {s?.ok ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="Cumplido" />
                        ) : s ? (
                          <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-label="Falta" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 text-muted" aria-label="Sin revisar" />
                        )}
                        <div className="space-y-1">
                          <p className={cn(s?.ok && 'text-muted line-through decoration-success/40')}>{r.text}</p>
                          {s && !s.ok && s.message && (
                            <p className="rounded-md bg-danger-soft px-2 py-1 text-xs text-danger">{s.message}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card className="p-5 space-y-3">
                <h2 className="font-semibold">Conceptos que usaste</h2>
                <p className="text-sm text-muted">
                  {concepts
                    ? 'Detectados en tu código. Los recomendados para este proyecto están marcados.'
                    : 'Tocá “Probar mi proyecto” para analizar tu código.'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set([...project.concepts, ...(concepts ?? [])])].map((k) => {
                    const used = concepts?.includes(k);
                    const recommended = project.concepts.includes(k);
                    return (
                      <span
                        key={k}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs',
                          used ? 'border-success/30 bg-success-soft text-success' : 'border-line text-muted',
                          !recommended && 'border-dashed'
                        )}
                      >
                        {used ? <CheckCircle2 className="size-3" /> : <Circle className="size-3" />}
                        {CONCEPT_LABELS[k] ?? k}
                      </span>
                    );
                  })}
                </div>
              </Card>
            </div>

            <section className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Tu proyecto">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <p className="font-mono text-xs text-muted">proyecto.py</p>
                  <SaveStatus />
                </div>
                <textarea
                  aria-label="Código del proyecto"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="block h-[520px] w-full resize-y bg-surface p-4 font-mono text-[13px] leading-relaxed outline-none"
                />
                <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2/60 p-3">
                  <Button variant="primary" icon={CheckCircle2} loading={checking} onClick={() => execute('check')}>
                    Probar mi proyecto
                  </Button>
                  <Button icon={Play} onClick={() => execute('run')}>
                    Ejecutar
                  </Button>
                  <Button variant="ghost" icon={Eye} onClick={() => setShowSolution((v) => !v)}>
                    {showSolution ? 'Ocultar solución' : 'Ver una solución'}
                  </Button>
                  <Button
                    variant="ghost"
                    icon={RotateCcw}
                    onClick={() => {
                      setCode(project.starter);
                      setStatus({});
                      setConcepts(null);
                      setRun(null);
                    }}
                  >
                    Reiniciar
                  </Button>
                  {!projectDone && (
                    <Button variant="ghost" icon={Send} loading={publishing} onClick={publish} className="ml-auto">
                      Publicar
                    </Button>
                  )}
                </div>
              </Card>

              {allPassed && run?.mode === 'check' && !checking && (
                <p className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 font-medium text-success animate-fade-up">
                  <CheckCircle2 className="size-5" aria-hidden /> ¡Todos los requisitos cumplidos!
                </p>
              )}

              {run && (
                <CodeRunner
                  key={run.id}
                  code={run.program}
                  language="python"
                  onLog={onLog}
                  hideLine={(t) => t.startsWith('§')}
                  onClose={() => setRun(null)}
                />
              )}

              {showSolution && (
                <Card className="overflow-hidden animate-fade-up">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2">
                    <p className="text-sm font-medium">Una solución posible</p>
                    <Button size="sm" variant="ghost" onClick={() => setCode(project.solution)}>
                      Copiar al editor
                    </Button>
                  </div>
                  <div className="max-h-[480px] overflow-auto">
                    <CodeBlock code={project.solution.trimEnd()} language="python" />
                  </div>
                </Card>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
