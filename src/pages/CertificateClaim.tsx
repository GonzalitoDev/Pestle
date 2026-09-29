import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Award, ChevronRight, CircleDashed, CloudOff } from 'lucide-react';
import { COURSES } from '../data/courses';
import { startProgressSync, syncNow, useCompleted } from '../lib/courseProgress';
import { CertificateError, certificatesAvailable, isValidName, issueCertificate, myCertificates, verifyUrl } from '../lib/certificates';
import CertificateArt from '../components/CertificateArt';
import { Button, Card, EmptyState, Field, Spinner, buttonClass } from '../components/ui';

const PROJECT_ID = 'proyecto';

/** /cursos/:courseId/certificado: asks for the student's name and issues the certificate. */
export default function CertificateClaim() {
  const { courseId } = useParams();
  const course = COURSES.find((c) => c.id === courseId);
  const navigate = useNavigate();
  const done = useCompleted();
  const [state, setState] = useState<'loading' | 'offline' | 'ready'>('loading');
  const [name, setName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    if (!course) return;
    startProgressSync();
    let cancelled = false;
    (async () => {
      if (!(await certificatesAvailable())) return !cancelled && setState('offline');
      // Already issued (here or on another device with the same code): go straight to it.
      const existing = (await myCertificates().catch(() => ({}) as Record<string, string>))[course.id];
      if (cancelled) return;
      if (existing) navigate(`/certificado/${existing}`, { replace: true });
      else setState('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [course, navigate]);

  if (!course) return <Navigate to="/cursos" replace />;

  const pending = [
    ...course.lessons.filter((l) => !done.has(`${course.id}/${l.id}`)).map((l) => ({ title: l.title, to: `/cursos/${course.id}/${l.id}` })),
    ...(done.has(`${course.id}/${PROJECT_ID}`)
      ? []
      : [{ title: `Proyecto final: ${course.project.title}`, to: `/cursos/${course.id}/${PROJECT_ID}` }]),
  ];
  const cleanName = name.replace(/\s+/g, ' ').trim();
  const nameOk = isValidName(cleanName);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMissing([]);
    if (!nameOk) return setError('Escribí tu nombre y apellido (solo letras, de 3 a 60 caracteres).');
    if (!confirmed) return setError('Confirmá que tu nombre está bien escrito.');
    setIssuing(true);
    try {
      // Make sure the server has the latest progress before it checks it.
      await syncNow();
      const cert = await issueCertificate(course.id, cleanName);
      navigate(`/certificado/${cert.id}`, { replace: true });
    } catch (err) {
      setIssuing(false);
      if (err instanceof CertificateError && err.missing.length) setMissing(err.missing);
      setError(err instanceof Error ? err.message : 'No se pudo emitir el certificado.');
    }
  };

  const header = (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted" aria-label="Ruta">
      <Link to="/cursos" className="hover:text-fg">
        Cursos
      </Link>
      <ChevronRight className="size-4" aria-hidden />
      <span>{course.title}</span>
      <ChevronRight className="size-4" aria-hidden />
      <span className="text-fg">Certificado</span>
    </nav>
  );

  if (state === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (state === 'offline') {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={CloudOff}
          title="Los certificados necesitan conexión con el servidor"
          description="El certificado se guarda en el servidor para que cualquiera pueda verificarlo. Conectate a internet (o conectá la base de datos del sitio) e intentá de nuevo."
        />
      </div>
    );
  }

  if (pending.length) {
    return (
      <div className="space-y-6 animate-fade-up">
        {header}
        <Card className="space-y-4 p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-2">
              <Award className="size-6 text-muted" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Terminá el curso para obtener tu certificado</h1>
              <p className="text-muted">
                El certificado se emite cuando completás las {course.lessons.length} lecciones y el proyecto final. Te
                falta:
              </p>
            </div>
          </div>
          <ul className="space-y-1">
            {pending.map((p) => (
              <li key={p.to}>
                <Link to={p.to} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2">
                  <CircleDashed className="size-4 shrink-0 text-muted" aria-hidden /> {p.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={pending[0].to} className={buttonClass('primary')}>
            Seguir con: {pending[0].title} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {header}
      <header className="space-y-1">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-3xl">
          <Award className="size-7 text-accent" aria-hidden /> Tu certificado
        </h1>
        <p className="text-muted">
          Completaste “{course.title}”. Escribí tu nombre como querés que aparezca: el certificado queda guardado con un
          código único y un QR para que cualquiera pueda comprobar que es real.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="h-fit p-5">
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Nombre y apellido" htmlFor="cert-name" hint="Tal cual querés que figure. No se puede cambiar después.">
              <input
                id="cert-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoComplete="name"
                autoCapitalize="words"
                placeholder="Ej.: Ana García"
                className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
              />
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--accent)]"
              />
              Revisé mi nombre y está bien escrito.
            </label>
            {error && (
              <div role="alert" className="space-y-1 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                <p className="flex items-center gap-1.5">
                  <AlertTriangle className="size-4 shrink-0" aria-hidden /> {error}
                </p>
                {missing.length > 0 && (
                  <ul className="list-disc pl-6">
                    {missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <Button type="submit" variant="primary" icon={Award} loading={issuing} disabled={!nameOk || !confirmed} className="w-full">
              Emitir mi certificado
            </Button>
          </form>
        </Card>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Vista previa</p>
          <div className="overflow-hidden rounded-xl border border-line shadow-card">
            <CertificateArt
              name={cleanName || 'Tu nombre'}
              courseTitle={course.title}
              level={course.level}
              lessons={course.lessons.length}
              projectTitle={course.project.title}
              issuedAt={Date.now()}
              id="PY-XXXX-XXXX-XXXX"
              verifyUrl={verifyUrl('PY-XXXX-XXXX-XXXX')}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
