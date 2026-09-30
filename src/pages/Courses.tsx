import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CheckCircle2, GraduationCap, History, Lock, Play, Sparkles, Trophy, BookOpenText } from 'lucide-react';
import { COURSES } from '../data/courses';
import { startProgressSync, useProgress } from '../lib/courseProgress';
import { Badge, Card, PageHeader, buttonClass } from '../components/ui';
import ProgressSync from '../components/ProgressSync';

/** Human title for a saved "last visited" path like /cursos/<course>/<lesson|proyecto>. */
function describe(path: string) {
  const [, , courseId, itemId] = path.split('/');
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return null;
  if (itemId === 'proyecto') return { course, title: `Proyecto final: ${course.project.title}` };
  const lesson = course.lessons.find((l) => l.id === itemId);
  return lesson ? { course, title: lesson.title } : null;
}

export default function Courses() {
  const progress = useProgress();
  const done = new Set(progress.done);
  const resume = progress.last ? describe(progress.last.path) : null;

  useEffect(() => startProgressSync(), []);

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        icon={GraduationCap}
        title="Cursos de Python"
        description="Aprendé programando: cada lección tiene una explicación, ejemplos que podés ejecutar y un ejercicio que se corrige solo. Todo corre en tu navegador, sin instalar nada."
      />

      {resume && progress.last && (
        <Link
          to={progress.last.path}
          className="group flex items-center gap-4 rounded-xl border border-accent/30 bg-accent-soft p-4 transition-colors hover:border-accent/60"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface">
            <History className="size-5 text-accent" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">Continuar donde lo dejaste</p>
            <p className="truncate font-medium">
              {resume.title} <span className="font-normal text-muted">· {resume.course.title}</span>
            </p>
          </div>
          <ArrowRight className="size-5 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {COURSES.map((course) => {
          const completed = course.lessons.filter((l) => done.has(`${course.id}/${l.id}`)).length;
          const total = course.lessons.length;
          const next = course.lessons.find((l) => !done.has(`${course.id}/${l.id}`)) ?? course.lessons[0];
          const pct = Math.round((completed / total) * 100);
          const projectDone = done.has(`${course.id}/proyecto`);
          const projectUnlocked = completed === total;
          return (
            <Card key={course.id} className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-accent-soft">
                  <BookOpen className="size-5 text-accent" aria-hidden />
                </div>
                <div className="flex gap-1.5">
                  {projectDone && (
                    <Badge tone="success">
                      <Award className="size-3" /> Completado
                    </Badge>
                  )}
                  <Badge tone={course.level === 'Principiante' ? 'success' : course.level === 'Avanzado' ? 'warn' : 'accent'}>
                    {course.level}
                  </Badge>
                </div>
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight">{course.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{course.description}</p>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>
                    {completed} de {total} lecciones
                  </span>
                  <span>{pct}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-surface-2"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso en ${course.title}`}
                >
                  <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <Link
                to={projectUnlocked && !projectDone ? `/cursos/${course.id}/proyecto` : `/cursos/${course.id}/${next.id}`}
                className={buttonClass(completed && !(projectUnlocked && !projectDone) ? 'secondary' : 'primary', 'md', 'mt-5')}
              >
                {projectUnlocked && !projectDone ? (
                  <>
                    <Sparkles className="size-4" aria-hidden /> Hacer el proyecto final
                  </>
                ) : completed === total ? (
                  <>
                    <CheckCircle2 className="size-4 text-success" aria-hidden /> Repasar
                  </>
                ) : completed ? (
                  <>
                    Continuar: {next.title} <ArrowRight className="size-4" aria-hidden />
                  </>
                ) : (
                  <>
                    <Play className="size-4" aria-hidden /> Empezar el curso
                  </>
                )}
              </Link>

              {projectDone && (
                <Link to={`/cursos/${course.id}/certificado`} className={buttonClass('success', 'md', 'mt-2')}>
                  <Award className="size-4" aria-hidden /> Ver mi certificado
                </Link>
              )}

              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-muted hover:text-fg">Ver temario</summary>
                <ol className="mt-3 space-y-1">
                  {course.lessons.map((l, i) => (
                    <li key={l.id}>
                      <Link
                        to={`/cursos/${course.id}/${l.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-2"
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
                      className="flex items-center gap-2 rounded-md px-2 py-1 font-medium hover:bg-surface-2"
                    >
                      {projectDone ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completado" />
                      ) : projectUnlocked ? (
                        <Sparkles className="size-4 shrink-0 text-accent" aria-hidden />
                      ) : (
                        <Lock className="size-4 shrink-0 text-muted" aria-label="Bloqueado" />
                      )}
                      Proyecto final: {course.project.title}
                    </Link>
                  </li>
                </ol>
              </details>
            </Card>
          );
        })}
      </div>

      <Link to="/logros" className="flex items-center gap-3 rounded-xl border border-warn/30 bg-warn-soft p-4 hover:border-warn/60">
        <Trophy className="size-6 shrink-0 text-warn" aria-hidden />
        <span className="flex-1">
          <span className="block font-medium">Tus logros</span>
          <span className="text-sm text-muted">Mirá qué medallas ganaste y cuánto te falta para las próximas.</span>
        </span>
        <ArrowRight className="size-5 text-warn" aria-hidden />
      </Link>

      <Link to="/guia" className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
        <BookOpenText className="size-6 shrink-0 text-accent" aria-hidden />
        <span className="flex-1">
          <span className="block font-medium">¿Preferís leer primero?</span>
          <span className="text-sm text-muted">La Guía de Python explica cada tema con calma, con ejemplos que podés ejecutar.</span>
        </span>
        <ArrowRight className="size-5 text-muted" aria-hidden />
      </Link>

      <ProgressSync />

      <p className="text-sm text-muted">
        ¿Te mostraron un certificado de Pestle?{' '}
        <Link to="/certificado" className="text-accent hover:underline">
          Verificalo acá
        </Link>
        .
      </p>

      <p className="text-sm text-muted">
        Python corre dentro de tu navegador (con Pyodide): la primera vez que ejecutes código tarda unos segundos en cargar.
      </p>
    </div>
  );
}
