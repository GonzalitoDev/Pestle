import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { buttonClass } from '../components/ui';

function InfoPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl space-y-8 animate-fade-up">
      <header className="space-y-2 border-b border-line pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted">{subtitle}</p>
      </header>
      <div className="space-y-7 leading-relaxed text-fg/90 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-fg [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-md [&_code]:border [&_code]:border-line [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
        {children}
      </div>
    </article>
  );
}

export function Privacy() {
  return (
    <InfoPage title="Privacidad" subtitle="Qué guarda Pestle y para qué">
      <section>
        <h2>Sin cuentas</h2>
        <p>
          En Pestle no hay registro. Tu navegador recibe un identificador al azar (guardado en <code>localStorage</code>) para
          que puedas ver y borrar lo que publicaste. El servidor solo guarda un hash de ese identificador (HMAC-SHA256), que no
          se puede revertir.
        </p>
      </section>
      <section>
        <h2>Qué guardamos</h2>
        <p>
          De cada código publicado: el título, el contenido, la visibilidad, la fecha de creación y el
          vencimiento, si elegiste uno. Nada de emails, cuentas, cookies de seguimiento ni estadísticas.
        </p>
      </section>
      <section>
        <h2>Progreso de los cursos</h2>
        <p>
          Si hacés los cursos de Python, las lecciones que completaste, el código que escribiste en cada ejercicio y la
          última lección que abriste se guardan en tu navegador y en el servidor, asociados a tu identificador anónimo
          (guardado como hash). Así no lo perdés si cerrás la página o cambiás de dispositivo. Se conserva durante un año
          desde tu último cambio.
        </p>
      </section>
      <section>
        <h2>Certificados</h2>
        <p>
          Cuando terminás un curso podés pedir un certificado. Se guarda el nombre que escribas, el curso, la fecha y una
          copia de tu proyecto final. Los certificados son públicos a propósito: cualquiera que tenga el código o el QR puede
          abrir la página de verificación y ver esos datos. Se guardan para siempre, para que sigan siendo verificables.
        </p>
      </section>
      <section>
        <h2>Ranking</h2>
        <p>
          Aparecer en el ranking es opcional. Si te sumás, se muestran públicamente el apodo que elijas y tus puntos. Podés
          cambiar el apodo o salir del ranking cuando quieras, y en ese caso se borran los dos.
        </p>
      </section>
      <section>
        <h2>Protección contra abusos</h2>
        <p>
          Para frenar el spam, la API cuenta los pedidos de cada dirección IP. La IP nunca se guarda tal cual: solo un hash,
          y cada contador se borra solo en un máximo de 10 minutos (una hora en el caso de los certificados).
        </p>
      </section>
      <section>
        <h2>Visibilidad</h2>
        <p>
          Lo que publicás como <strong>Público</strong> aparece en <Link to="/explore">Explorar</Link>. Lo{' '}
          <strong>Oculto</strong> nunca aparece ahí, pero cualquiera que tenga el enlace lo puede abrir. No publiques
          contraseñas, claves de API ni datos personales.
        </p>
      </section>
      <section>
        <h2>Borrado</h2>
        <p>
          Lo que tiene vencimiento se borra solo cuando vence. Podés borrar cualquier código tuyo desde su página con el botón{' '}
          <strong>Eliminar</strong>. Si borrás los datos del navegador perdés tu identificador y, con él, la posibilidad de
          borrar lo que publicaste antes (salvo que hayas guardado el código de "Seguí en otro dispositivo").
        </p>
      </section>
      <section>
        <h2>Ejecutor de código</h2>
        <p>
          El código que ejecutás corre solo en tu navegador, dentro de un entorno aislado que no tiene acceso a este sitio,
          a su almacenamiento ni a tus cookies, y que no puede abrir ventanas ni redirigir la página. Nunca se manda a
          nuestros servidores.
        </p>
      </section>
    </InfoPage>
  );
}

export function Terms() {
  return (
    <InfoPage title="Términos de uso" subtitle="Cortos y simples">
      <section>
        <h2>Uso aceptable</h2>
        <p>
          Compartí código y textos que tengas derecho a compartir. No subas malware, contenido ilegal, credenciales ni datos
          personales de otras personas. El contenido abusivo se puede borrar sin aviso.
        </p>
      </section>
      <section>
        <h2>Ejecutar código</h2>
        <p>
          Ejecutá solo código que entiendas. El ejecutor está aislado, pero el código igual puede hacer pedidos a internet
          desde tu navegador.
        </p>
      </section>
      <section>
        <h2>Cursos y certificados</h2>
        <p>
          Los cursos son gratuitos. Los certificados de Pestle acreditan que terminaste un curso de esta plataforma; no son
          títulos oficiales. Pedir un certificado con un nombre falso o sin haber hecho el curso va en contra de estos
          términos.
        </p>
      </section>
      <section>
        <h2>Sin garantías</h2>
        <p>
          Pestle se ofrece tal como está, sin garantías de que esté siempre disponible ni de que los datos se conserven.
          Guardá tu propia copia de lo que sea importante. Los ejemplos de la biblioteca de códigos se ofrecen con licencia
          MIT.
        </p>
      </section>
      <section>
        <h2>Límites</h2>
        <p>
          Cada código puede pesar hasta 512&nbsp;KB y los títulos pueden tener hasta 200 caracteres. La API permite 20
          publicaciones cada 10 minutos y 300 lecturas por minuto por dirección IP; por encima de eso responde{' '}
          <code>429 Too Many Requests</code>.
        </p>
      </section>
    </InfoPage>
  );
}

const ENDPOINTS: { method: string; path: string; description: string; example: string }[] = [
  {
    method: 'GET',
    path: '/api/health',
    description: 'Estado del servicio y si la base de datos está conectada.',
    example: `curl ${location.origin}/api/health`,
  },
  {
    method: 'POST',
    path: '/api/pastes',
    description:
      'Publica un código Python. Cuerpo: { content, title?, isPublic?, expiresIn? } (language es opcional y solo puede ser python); expiresIn puede ser never, 1h, 1d o 1w. Mandá x-owner-id (cualquier texto al azar de 16 caracteres o más) para poder listarlo y borrarlo después.',
    example: `curl -X POST ${location.origin}/api/pastes \\
  -H 'content-type: application/json' \\
  -H 'x-owner-id: mi-identificador-secreto-123' \\
  -d '{"content":"print(42)","expiresIn":"1d"}'`,
  },
  {
    method: 'GET',
    path: '/api/pastes/:id',
    description: 'Devuelve un código en JSON. Agregá ?raw=1 para recibir texto plano, ideal para curl o scripts.',
    example: `curl ${location.origin}/api/pastes/ID?raw=1`,
  },
  {
    method: 'GET',
    path: '/api/pastes?scope=public',
    description: 'Los últimos 50 códigos públicos (con el contenido recortado como vista previa).',
    example: `curl '${location.origin}/api/pastes?scope=public'`,
  },
  {
    method: 'GET',
    path: '/api/pastes',
    description: 'Tus propios códigos, identificados por el encabezado x-owner-id.',
    example: `curl ${location.origin}/api/pastes -H 'x-owner-id: mi-identificador-secreto-123'`,
  },
  {
    method: 'DELETE',
    path: '/api/pastes/:id',
    description: 'Borra un código. Solo funciona con el mismo x-owner-id que se usó para crearlo.',
    example: `curl -X DELETE ${location.origin}/api/pastes/ID -H 'x-owner-id: mi-identificador-secreto-123'`,
  },
  {
    method: 'GET',
    path: '/api/certificates?id=PY-XXXX-XXXX-XXXX',
    description: 'Verifica un certificado: devuelve el nombre, el curso, la fecha, el proyecto final y si es válido.',
    example: `curl '${location.origin}/api/certificates?id=PY-XXXX-XXXX-XXXX'`,
  },
];

const METHOD_TONES: Record<string, string> = {
  GET: 'bg-success-soft text-success',
  POST: 'bg-accent-soft text-accent',
  DELETE: 'bg-danger-soft text-danger',
};

export function ApiDocs() {
  return (
    <InfoPage title="API" subtitle="Usá Pestle desde la terminal o tus programas">
      <p>
        Todo lo que hace la página está disponible como API JSON. Las respuestas son JSON salvo que pidas{' '}
        <code>?raw=1</code>. Los errores devuelven <code>{'{ "error": "..." }'}</code> con un estado 4xx/5xx. Los{' '}
        <code>POST</code> necesitan <code>content-type: application/json</code>. Límites: 20 publicaciones cada 10&nbsp;min
        y 300 lecturas por minuto por IP.
      </p>
      {ENDPOINTS.map((e) => (
        <section key={e.method + e.path} className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
            <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${METHOD_TONES[e.method] ?? ''}`}>{e.method}</span>
            <span className="font-mono text-sm font-medium break-all">{e.path}</span>
          </div>
          <p className="px-4 py-3 text-sm text-muted">{e.description}</p>
          <pre className="mx-4 mb-4 overflow-x-auto rounded-lg bg-console p-3 font-mono text-xs text-console-fg">{e.example}</pre>
        </section>
      ))}
    </InfoPage>
  );
}

export function NotFound() {
  return (
    <div className="flex h-[55vh] flex-col items-center justify-center gap-4 text-center animate-fade-up">
      <p className="font-mono text-7xl font-bold text-line-strong">404</p>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Página no encontrada</h1>
        <p className="text-muted">La página que buscás no existe o se movió.</p>
      </div>
      <Link to="/" className={buttonClass('primary')}>
        Volver al inicio
      </Link>
    </div>
  );
}
