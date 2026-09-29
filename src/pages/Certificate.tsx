import { FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Linkedin,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';
import { Certificate as Cert, getCertificate, verifyUrl } from '../lib/certificates';
import { isNative } from '../lib/platform';
import { copyText } from '../lib/utils';
import CertificateArt, { formatLongDate, svgToPng } from '../components/CertificateArt';
import CodeBlock from '../components/CodeBlock';
import { Button, Card, EmptyState, PageHeader, Spinner, buttonClass } from '../components/ui';
import { useToast } from '../components/Toast';

// Printing shows only the certificate, on one A4 landscape page.
const PRINT_CSS = `
@media print {
  @page { size: A4 landscape; margin: 0; }
  html, body { background: #fff !important; }
  body > *:not(#certificate-print) { display: none !important; }
  #certificate-print { display: block !important; }
  #certificate-print svg { width: 297mm; height: 210mm; display: block; }
}`;

/** /certificado/:id: public verification page. /certificado: form to verify a code. */
export default function Certificate() {
  const { id } = useParams();
  return id ? <CertificateView key={id} id={id} /> : <VerifyForm />;
}

function VerifyForm({ initial = '' }: { initial?: string }) {
  const navigate = useNavigate();
  const [code, setCode] = useState(initial);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (value) navigate(`/certificado/${encodeURIComponent(value)}`);
  };
  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-up">
      <PageHeader
        icon={SearchCheck}
        title="Verificar un certificado"
        description="Escribí el código que aparece abajo a la izquierda del certificado (por ejemplo PY-7K3M-Q9TD-X2WA) o escaneá su QR."
      />
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="cert-code" className="sr-only">
          Código del certificado
        </label>
        <input
          id="cert-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="PY-XXXX-XXXX-XXXX"
          autoCapitalize="characters"
          spellCheck={false}
          className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 font-mono text-sm uppercase outline-none focus:border-accent"
        />
        <Button type="submit" variant="primary" icon={SearchCheck}>
          Verificar
        </Button>
      </form>
    </div>
  );
}

function CertificateView({ id }: { id: string }) {
  const toast = useToast();
  const svgRef = useRef<SVGSVGElement>(null);
  const [cert, setCert] = useState<Cert | null>(null);
  const [error, setError] = useState<'notfound' | 'network' | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCertificate(id)
      .then(setCert)
      .catch((err) => setError(err?.status === 404 ? 'notfound' : 'network'));
  }, [id]);

  useEffect(() => {
    if (cert) document.title = `Certificado de ${cert.name} · ${cert.courseTitle} · Pestle`;
    return () => void (document.title = 'Pestle');
  }, [cert]);

  if (error === 'notfound') {
    return (
      <div className="space-y-8">
        <EmptyState
          icon={AlertTriangle}
          title="No existe un certificado con ese código"
          description={`Revisá que el código esté bien escrito: ${id.toUpperCase()}.`}
        />
        <VerifyForm initial={id.toUpperCase()} />
      </div>
    );
  }
  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No se pudo verificar ahora"
        description="Revisá tu conexión e intentá de nuevo en un momento."
        action={
          <Button onClick={() => window.location.reload()} variant="primary">
            Reintentar
          </Button>
        }
      />
    );
  }
  if (!cert) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-6" />
      </div>
    );
  }

  const url = verifyUrl(cert.id);
  const art = (
    <CertificateArt
      name={cert.name}
      courseTitle={cert.courseTitle}
      level={cert.level}
      lessons={cert.lessons}
      projectTitle={cert.projectTitle}
      issuedAt={cert.issuedAt}
      id={cert.id}
      verifyUrl={url}
    />
  );
  const fileName = `Certificado-${cert.courseTitle}-${cert.name}`.replace(/[^\p{L}\p{N}-]+/gu, '_');
  const issued = new Date(cert.issuedAt);
  const linkedIn =
    'https://www.linkedin.com/profile/add?' +
    new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: `${cert.courseTitle} (Python)`,
      organizationName: 'Pestle',
      issueYear: String(issued.getFullYear()),
      issueMonth: String(issued.getMonth() + 1),
      certUrl: url,
      certId: cert.id,
    });

  const copyLink = async () => {
    await copyText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePng = async () => {
    if (!svgRef.current) return;
    setSaving(true);
    try {
      const blob = await svgToPng(svgRef.current);
      if (isNative) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        await Filesystem.writeFile({ path: `Pestle/${fileName}.png`, data, directory: Directory.Documents, recursive: true });
        toast(`Guardado en Documents/Pestle/${fileName}.png`);
      } else {
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = `${fileName}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      }
    } catch {
      toast('No se pudo generar la imagen', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <style>{PRINT_CSS}</style>
      {createPortal(
        <div id="certificate-print" className="hidden" aria-hidden>
          {art}
        </div>,
        document.body
      )}

      {cert.valid ? (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-success/30 bg-success-soft p-4 sm:flex-row sm:items-center"
        >
          <ShieldCheck className="size-8 shrink-0 text-success" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold text-success">Certificado válido</p>
            <p className="text-sm">
              Emitido por Pestle el {formatLongDate(cert.issuedAt)} a nombre de <strong>{cert.name}</strong>, por completar
              “{cert.courseTitle}”. Código {cert.id}.
            </p>
          </div>
        </div>
      ) : (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-danger">
          <AlertTriangle className="size-8 shrink-0" aria-hidden />
          <p className="font-semibold">Este certificado fue modificado después de emitirse: no es válido.</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line shadow-card">
        <CertificateArt
          ref={svgRef}
          name={cert.name}
          courseTitle={cert.courseTitle}
          level={cert.level}
          lessons={cert.lessons}
          projectTitle={cert.projectTitle}
          issuedAt={cert.issuedAt}
          id={cert.id}
          verifyUrl={url}
          className="block h-auto w-full"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {isNative ? (
          <a href={url} target="_blank" rel="noreferrer" className={buttonClass('primary')}>
            <ExternalLink className="size-4" aria-hidden /> Abrir para descargar en PDF
          </a>
        ) : (
          <Button variant="primary" icon={FileText} onClick={() => window.print()} title="Elegí “Guardar como PDF” en la ventana de impresión">
            Descargar PDF
          </Button>
        )}
        <Button icon={saving ? Download : ImageIcon} loading={saving} onClick={savePng}>
          Descargar imagen
        </Button>
        <Button icon={copied ? Check : Copy} onClick={copyLink}>
          {copied ? 'Enlace copiado' : 'Copiar enlace de verificación'}
        </Button>
        {cert.isOwner && (
          <a href={linkedIn} target="_blank" rel="noreferrer" className={buttonClass('secondary')}>
            <Linkedin className="size-4" aria-hidden /> Agregar a LinkedIn
          </a>
        )}
      </div>
      {!isNative && (
        <p className="text-xs text-muted">
          Para el PDF, en la ventana de impresión elegí “Guardar como PDF” como destino.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Award className="size-5 text-accent" aria-hidden /> Qué certifica
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
            <li>
              Que {cert.name} resolvió las {cert.lessons} lecciones del curso “{cert.courseTitle}” (nivel{' '}
              {cert.level.toLowerCase()}). Cada ejercicio se corrige solo con pruebas automáticas.
            </li>
            <li>Que su proyecto final “{cert.projectTitle}” cumplió todos los requisitos. Podés ver el código acá al lado.</li>
            <li>
              Que el certificado fue emitido por Pestle y no se modificó: el código {cert.id} es único y esta página lo
              comprueba cada vez que se abre.
            </li>
          </ul>
          <p className="text-xs text-muted">
            Pestle es una plataforma de aprendizaje gratuita: este es un certificado de finalización de curso, no un título
            oficial.
          </p>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="text-sm font-medium">Proyecto final entregado: {cert.projectTitle}</h2>
          </div>
          <div className="max-h-[420px] overflow-auto">
            <CodeBlock code={cert.projectCode.trimEnd()} language="python" />
          </div>
        </Card>
      </div>

      {cert.isOwner && (
        <p className="text-sm text-muted">
          ¿Querés aprender más? <Link to="/cursos" className="text-accent hover:underline">Mirá los otros cursos</Link>.
        </p>
      )}
    </div>
  );
}
