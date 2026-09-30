/**
 * Permanent copy of everything in Supabase (Postgres), written through its REST API.
 * Redis stays the fast store the site reads from; every save is also sent here so all the data
 * can be browsed, queried and backed up in the Supabase dashboard (tables "pestle_*").
 *
 * Needs two environment variables in Vercel (never in the code):
 *   SUPABASE_URL                 e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    Settings → API keys → service_role / secret
 * Without them this module does nothing. Failures are logged and never break the request.
 */
const clean = (v?: string) => (v ?? '').trim().replace(/^["']|["']$/g, '');
// Accept the URL with or without a trailing "/rest/v1" or slash, as people often paste it.
const URL_BASE = clean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '');
const KEY = clean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);

export const dbEnabled = Boolean(URL_BASE && KEY);

/** Which pieces are missing, for /api/health (never the values). */
export const dbConfig = { url: Boolean(URL_BASE), clave: Boolean(KEY), formatoClave: KEY.startsWith('sb_') ? 'nueva' : KEY ? 'jwt' : null };

/**
 * Old keys are JWTs ("eyJ…") and also go in Authorization. New secret keys ("sb_secret_…") are
 * not JWTs and must only be sent in the apikey header.
 */
const authHeaders = (): Record<string, string> =>
  KEY.startsWith('sb_') ? { apikey: KEY } : { apikey: KEY, authorization: `Bearer ${KEY}` };

async function rest(path: string, init: RequestInit & { prefer?: string; timeout?: number }): Promise<boolean> {
  if (!dbEnabled) return false;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
      ...init,
      headers: {
        ...authHeaders(),
        'content-type': 'application/json',
        prefer: init.prefer ?? 'return=minimal',
      },
      signal: AbortSignal.timeout(init.timeout ?? 4000),
    });
    if (!res.ok) console.error('supabase', path, res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (err) {
    console.error('supabase', path, err instanceof Error ? err.message : err);
    return false;
  }
}

// Big batches (the backup copy) get more time than a single row.
const timeoutFor = (rows: object | object[]) => (Array.isArray(rows) && rows.length > 20 ? 25000 : 4000);

/** Insert or update rows (by the table's primary key / given columns). */
export const upsert = (table: string, rows: object | object[], onConflict: string) =>
  rest(`${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    body: JSON.stringify(rows),
    prefer: 'resolution=merge-duplicates,return=minimal',
    timeout: timeoutFor(rows),
  });

/** Insert only; rows whose key already exists are left as they are. */
export const insertIgnore = (table: string, rows: object | object[], onConflict: string) =>
  rest(`${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    body: JSON.stringify(rows),
    prefer: 'resolution=ignore-duplicates,return=minimal',
    timeout: timeoutFor(rows),
  });

export const insert = (table: string, rows: object | object[]) =>
  rest(table, { method: 'POST', body: JSON.stringify(rows) });

export const update = (table: string, filter: string, values: object) =>
  rest(`${table}?${filter}`, { method: 'PATCH', body: JSON.stringify(values) });

const iso = (t?: number | null) => (t ? new Date(t).toISOString() : null);

/** Makes sure the (anonymous) user row exists before anything that references it. */
export const touchUser = (ownerHash: string) =>
  upsert('pestle_usuarios', { owner_hash: ownerHash, actualizado: new Date().toISOString() }, 'owner_hash');

/** The public key can read nothing and write nothing here (RLS): it must be the secret one. */
function isPublicKey() {
  if (KEY.startsWith('sb_publishable_')) return true;
  if (!KEY.startsWith('eyJ')) return false;
  try {
    return JSON.parse(Buffer.from(KEY.split('.')[1], 'base64url').toString()).role === 'anon';
  } catch {
    return false;
  }
}

/** Checks that Supabase answers and the Pestle tables exist, for /api/health. */
export async function checkDb(): Promise<{ ok: boolean; detalle: string }> {
  if (!URL_BASE) return { ok: false, detalle: 'Falta la variable SUPABASE_URL en Vercel (y después hay que hacer Redeploy).' };
  if (!KEY) return { ok: false, detalle: 'Falta la variable SUPABASE_SERVICE_ROLE_KEY en Vercel (y después hay que hacer Redeploy).' };
  if (isPublicKey())
    return {
      ok: false,
      detalle:
        'SUPABASE_SERVICE_ROLE_KEY tiene la clave pública (anon / publishable). Tiene que ser la secreta: service_role o sb_secret_…',
    };
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/pestle_resumen?select=*`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { ok: true, detalle: 'Conectado: los datos se están guardando en Supabase.' };
    if (res.status === 401 || res.status === 403)
      return { ok: false, detalle: `Supabase rechazó la clave (${res.status}). Revisá que SUPABASE_SERVICE_ROLE_KEY sea la clave secreta (service_role) de este proyecto.` };
    if (res.status === 404)
      return { ok: false, detalle: 'Supabase responde, pero no encuentra las tablas pestle_*. Revisá que SUPABASE_URL sea la del proyecto correcto.' };
    return { ok: false, detalle: `Supabase respondió con un error ${res.status}.` };
  } catch (err) {
    return { ok: false, detalle: `No se pudo conectar con Supabase: ${err instanceof Error ? err.message : err}. Revisá SUPABASE_URL.` };
  }
}

export const db = {
  async progress(ownerHash: string, p: { done: string[]; code: Record<string, { v: string; t: number }>; last?: unknown }) {
    if (!dbEnabled) return;
    await touchUser(ownerHash);
    await upsert(
      'pestle_progreso',
      {
        owner_hash: ownerHash,
        lecciones_completadas: p.done,
        codigo: p.code,
        ultima_visita: p.last ?? null,
        actualizado: new Date().toISOString(),
      },
      'owner_hash'
    );
  },
  async records(ownerHash: string, logros: Record<string, number>, cursos: Record<string, number>) {
    if (!dbEnabled) return;
    await touchUser(ownerHash);
    const l = Object.entries(logros).map(([id, t]) => ({ owner_hash: ownerHash, logro_id: id, desbloqueado: iso(t) }));
    const c = Object.entries(cursos).map(([id, t]) => ({ owner_hash: ownerHash, curso_id: id, completado: iso(t) }));
    if (l.length) await insertIgnore('pestle_logros', l, 'owner_hash,logro_id');
    if (c.length) await insertIgnore('pestle_cursos_completados', c, 'owner_hash,curso_id');
  },
  async ranking(ownerHash: string, apodo: string | null, puntos?: number) {
    if (!dbEnabled) return;
    await upsert(
      'pestle_usuarios',
      { owner_hash: ownerHash, apodo, ...(puntos !== undefined ? { puntos } : {}), actualizado: new Date().toISOString() },
      'owner_hash'
    );
  },
  async points(ownerHash: string, puntos: number) {
    await update('pestle_usuarios', `owner_hash=eq.${encodeURIComponent(ownerHash)}`, { puntos });
  },
  async certificate(c: {
    id: string;
    ownerHash: string;
    name: string;
    courseId: string;
    courseTitle: string;
    level: string;
    lessons: number;
    projectTitle: string;
    projectCode: string;
    issuedAt: number;
  }) {
    await insertIgnore(
      'pestle_certificados',
      {
        id: c.id,
        owner_hash: c.ownerHash,
        nombre: c.name,
        curso_id: c.courseId,
        curso: c.courseTitle,
        nivel: c.level,
        lecciones: c.lessons,
        proyecto: c.projectTitle,
        proyecto_codigo: c.projectCode,
        emitido: iso(c.issuedAt),
      },
      'id'
    );
  },
  async paste(p: {
    id: string;
    ownerHash?: string;
    title?: string;
    content: string;
    language: string;
    isPublic: boolean;
    createdAt: number;
    expiresAt?: number;
  }) {
    await insertIgnore(
      'pestle_codigos',
      {
        id: p.id,
        owner_hash: p.ownerHash ?? null,
        titulo: p.title ?? null,
        contenido: p.content,
        lenguaje: p.language,
        publico: p.isPublic,
        creado: iso(p.createdAt),
        vence: iso(p.expiresAt),
      },
      'id'
    );
  },
  async pasteDeleted(id: string) {
    await update('pestle_codigos', `id=eq.${encodeURIComponent(id)}`, { borrado: new Date().toISOString() });
  },
  async suggestion(s: { texto: string; contacto: string; pagina: string }) {
    await insert('pestle_sugerencias', { texto: s.texto, contacto: s.contacto || null, pagina: s.pagina || null });
  },
};
