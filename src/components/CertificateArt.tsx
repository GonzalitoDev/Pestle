import { forwardRef, useMemo } from 'react';
import qrcode from 'qrcode-generator';

export const CERT_WIDTH = 1123;
export const CERT_HEIGHT = 794;

export interface CertificateArtProps {
  name: string;
  courseTitle: string;
  level: string;
  lessons: number;
  projectTitle: string;
  issuedAt: number;
  id: string;
  verifyUrl: string;
  className?: string;
}

// Fixed palette: a certificate looks the same in light and dark mode, on screen, printed or as PNG.
const INK = '#1c2340';
const GOLD = '#b08d3c';
const PAPER = '#fbf8f1';
const SOFT = '#5b6078';
// System fonts only: the PNG export renders the SVG as an image, where web fonts don't load.
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

export const formatLongDate = (t: number) =>
  new Date(t).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

/** The QR as a single SVG path (one square per dark module). */
function qrPath(text: string) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return { d, n };
}

/** The certificate itself, drawn as an A4-landscape SVG (screen, print and PNG use the same drawing). */
const CertificateArt = forwardRef<SVGSVGElement, CertificateArtProps>(function CertificateArt(
  { name, courseTitle, level, lessons, projectTitle, issuedAt, id, verifyUrl, className },
  ref
) {
  const qr = useMemo(() => qrPath(verifyUrl), [verifyUrl]);
  const nameSize = name.length > 26 ? Math.max(30, Math.round((58 * 26) / name.length)) : 58;
  const QR_SIZE = 116;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${CERT_WIDTH} ${CERT_HEIGHT}`}
      className={className}
      role="img"
      aria-label={`Certificado de ${name}: ${courseTitle}`}
    >
      <rect width={CERT_WIDTH} height={CERT_HEIGHT} fill={PAPER} />
      {/* Frame */}
      <rect x="28" y="28" width={CERT_WIDTH - 56} height={CERT_HEIGHT - 56} fill="none" stroke={INK} strokeWidth="3" />
      <rect x="40" y="40" width={CERT_WIDTH - 80} height={CERT_HEIGHT - 80} fill="none" stroke={GOLD} strokeWidth="1.5" />
      {[
        [40, 40],
        [CERT_WIDTH - 40, 40],
        [40, CERT_HEIGHT - 40],
        [CERT_WIDTH - 40, CERT_HEIGHT - 40],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 7} y={y - 7} width="14" height="14" fill={GOLD} transform={`rotate(45 ${x} ${y})`} />
      ))}

      <g textAnchor="middle" fill={INK}>
        <text x={CERT_WIDTH / 2} y="112" fontFamily={SANS} fontSize="17" fontWeight="700" letterSpacing="6">
          PESTLE · CURSOS DE PYTHON
        </text>
        <text x={CERT_WIDTH / 2} y="186" fontFamily={SERIF} fontSize="50">
          Certificado de finalización
        </text>
        <line x1={CERT_WIDTH / 2 - 90} x2={CERT_WIDTH / 2 + 90} y1="212" y2="212" stroke={GOLD} strokeWidth="2" />

        <text x={CERT_WIDTH / 2} y="262" fontFamily={SANS} fontSize="19" fill={SOFT}>
          Se certifica que
        </text>
        <text x={CERT_WIDTH / 2} y="336" fontFamily={SERIF} fontSize={nameSize} fontStyle="italic">
          {name}
        </text>
        <line x1="240" x2={CERT_WIDTH - 240} y1="360" y2="360" stroke={INK} strokeOpacity="0.25" />

        <text x={CERT_WIDTH / 2} y="404" fontFamily={SANS} fontSize="19" fill={SOFT}>
          completó el curso
        </text>
        <text x={CERT_WIDTH / 2} y="448" fontFamily={SERIF} fontSize="34" fontWeight="700">
          {courseTitle}
        </text>
        <text x={CERT_WIDTH / 2} y="490" fontFamily={SANS} fontSize="17" fill={SOFT}>
          {`Nivel ${level.toLowerCase()} · ${lessons} lecciones con ejercicios corregidos automáticamente`}
        </text>
        <text x={CERT_WIDTH / 2} y="518" fontFamily={SANS} fontSize="17" fill={SOFT}>
          {`y aprobó el proyecto final «${projectTitle}».`}
        </text>
      </g>

      {/* Verification: QR, link and id */}
      <g transform={`translate(88 ${CERT_HEIGHT - 88 - QR_SIZE})`}>
        <rect x="-6" y="-6" width={QR_SIZE + 12} height={QR_SIZE + 12} fill="#fff" />
        <path d={qr.d} fill={INK} transform={`scale(${QR_SIZE / qr.n})`} shapeRendering="crispEdges" />
      </g>
      <g fontFamily={SANS} fill={INK}>
        <text x={88 + QR_SIZE + 22} y={CERT_HEIGHT - 170} fontSize="13" fill={SOFT} letterSpacing="1.5">
          CÓDIGO DE VERIFICACIÓN
        </text>
        <text x={88 + QR_SIZE + 22} y={CERT_HEIGHT - 146} fontSize="20" fontWeight="700" fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {id}
        </text>
        <text x={88 + QR_SIZE + 22} y={CERT_HEIGHT - 118} fontSize="13" fill={SOFT}>
          Escaneá el código o entrá a
        </text>
        <text x={88 + QR_SIZE + 22} y={CERT_HEIGHT - 99} fontSize="13" fill={SOFT}>
          {verifyUrl.replace(/^https?:\/\//, '')}
        </text>
      </g>

      {/* Date and issuer */}
      <g textAnchor="middle" fontFamily={SANS} fill={INK}>
        <text x={CERT_WIDTH - 340} y={CERT_HEIGHT - 150} fontFamily={SERIF} fontSize="22">
          {formatLongDate(issuedAt)}
        </text>
        <line x1={CERT_WIDTH - 450} x2={CERT_WIDTH - 230} y1={CERT_HEIGHT - 134} y2={CERT_HEIGHT - 134} stroke={INK} strokeOpacity="0.4" />
        <text x={CERT_WIDTH - 340} y={CERT_HEIGHT - 112} fontSize="13" fill={SOFT}>
          Fecha de emisión · Pestle
        </text>
      </g>

      {/* Seal (right corner, clear of the verification link) */}
      <g transform={`translate(${CERT_WIDTH - 140} ${CERT_HEIGHT - 142})`}>
        <circle r="46" fill={GOLD} />
        <circle r="39" fill="none" stroke={PAPER} strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M-15 1 l10 10 l20 -22" fill="none" stroke={PAPER} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <text y="28" textAnchor="middle" fontFamily={SANS} fontSize="8" fontWeight="700" fill={PAPER} letterSpacing="1">
          VERIFICADO
        </text>
      </g>
    </svg>
  );
});

export default CertificateArt;

/** Renders the SVG to a PNG (2x) so it can be saved or shared as an image. */
export async function svgToPng(svg: SVGSVGElement, scale = 2): Promise<Blob> {
  const markup = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = CERT_WIDTH * scale;
  canvas.height = CERT_HEIGHT * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG'))), 'image/png'));
}
