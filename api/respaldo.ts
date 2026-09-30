import { dbEnabled, insertIgnore, upsert } from './_lib/db.js';
import { hmac, json, redis, safe, storageUnavailable } from './_lib/store.js';
import { NAMES_KEY, RANKING_KEY } from './_lib/ranking.js';
import type { UserRecord } from './_lib/records.js';

/**
 * One-off (repeatable) copy of everything already stored in Redis into Supabase, so the Supabase
 * tables also contain the data saved before they existed. Running it again is safe: existing
 * rows are updated or skipped, never duplicated.
 *
 * Protected by the RESPALDO_CLAVE environment variable (16+ characters). Call it with
 *   curl -X POST https://<sitio>/api/respaldo -H "x-clave: <RESPALDO_CLAVE>"
 * Without that variable the endpoint doesn't exist (404).
 */

const BATCH = 200;
const iso = (t?: number | null) => (t ? new Date(t).toISOString() : null);

async function sameSecret(given: string, expected: string) {
  // Compare hashes so the check takes the same time whatever the input.
  return (await hmac(`respaldo:${given}`)) === (await hmac(`respaldo:${expected}`));
}

async function scanKeys(pattern: string) {
  const keys: string[] = [];
  let cursor = '0';
  do {
    const [next, found] = (await redis!.scan(cursor, { match: pattern, count: 500 })) as [string | number, string[]];
    keys.push(...found);
    cursor = String(next);
  } while (cursor !== '0');
  return keys;
}

async function values<T>(keys: string[]) {
  const out: T[] = [];
  for (let i = 0; i < keys.length; i += 100) {
    const chunk = keys.slice(i, i + 100);
    if (chunk.length) out.push(...((await redis!.mget<T[]>(...chunk)) as T[]));
  }
  return out;
}

async function send(table: string, rows: object[], onConflict: string, mode: 'upsert' | 'ignore') {
  let ok = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const done = mode === 'upsert' ? await upsert(table, chunk, onConflict) : await insertIgnore(table, chunk, onConflict);
    if (done) ok += chunk.length;
    else failed += chunk.length;
  }
  return { enviados: ok, fallidos: failed };
}

export const POST = safe(async (request) => {
  const expected = process.env.RESPALDO_CLAVE ?? '';
  if (expected.length < 16) return json({ error: 'No encontrado' }, 404);
  if (!(await sameSecret(request.headers.get('x-clave') ?? '', expected))) return json({ error: 'Clave incorrecta' }, 403);
  if (!redis) return storageUnavailable();
  if (!dbEnabled) return json({ error: 'Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel' }, 503);

  // --- read everything from Redis
  const progressKeys = await scanKeys('progress:*');
  const progress = await values<{ done?: string[]; code?: object; last?: object }>(progressKeys);
  const recordKeys = await scanKeys('usuario:*');
  const records = await values<UserRecord>(recordKeys);
  const certs = await values<Record<string, unknown>>(await scanKeys('cert:*'));
  const pastes = await values<Record<string, unknown>>(await scanKeys('paste:*'));
  const names = new Map<string, string>();
  const points = new Map<string, number>();
  const rawRanking = (await redis.zrange(RANKING_KEY, 0, -1, { withScores: true })) as unknown[];
  const flat = rawRanking.flatMap((x) => (Array.isArray(x) ? x : [x]));
  for (let i = 0; i < flat.length; i += 2) points.set(String(flat[i]), Number(flat[i + 1]));
  if (points.size) {
    const n = (await redis.hmget<Record<string, string>>(NAMES_KEY, ...points.keys())) ?? {};
    for (const [hash, nick] of Object.entries(n)) if (nick) names.set(hash, nick);
  }
  const suggestions = (await redis.lrange('sugerencias', 0, -1)).map((s) =>
    typeof s === 'string' ? JSON.parse(s) : s
  ) as { texto: string; contacto?: string; pagina?: string; fecha?: string }[];

  // --- users first (the other tables reference them)
  const hashOf = (key: string, prefix: string) => key.slice(prefix.length);
  const users = new Set<string>([
    ...progressKeys.map((k) => hashOf(k, 'progress:')),
    ...recordKeys.map((k) => hashOf(k, 'usuario:')),
    ...points.keys(),
  ]);
  const now = new Date().toISOString();
  const result: Record<string, unknown> = {};
  result.pestle_usuarios = await send(
    'pestle_usuarios',
    [...users].map((h) => ({
      owner_hash: h,
      apodo: names.get(h) ?? null,
      puntos: points.get(h) ?? 0,
      creado: iso(records[recordKeys.indexOf(`usuario:${h}`)]?.desde) ?? now,
      actualizado: now,
    })),
    'owner_hash',
    'upsert'
  );

  result.pestle_progreso = await send(
    'pestle_progreso',
    progressKeys
      .map((k, i) => ({ k, p: progress[i] }))
      .filter(({ p }) => p)
      .map(({ k, p }) => ({
        owner_hash: hashOf(k, 'progress:'),
        lecciones_completadas: p.done ?? [],
        codigo: p.code ?? {},
        ultima_visita: p.last ?? null,
        actualizado: now,
      })),
    'owner_hash',
    'upsert'
  );

  const logros: object[] = [];
  const cursos: object[] = [];
  recordKeys.forEach((k, i) => {
    const r = records[i];
    if (!r) return;
    const h = hashOf(k, 'usuario:');
    for (const [id, t] of Object.entries(r.logros ?? {})) logros.push({ owner_hash: h, logro_id: id, desbloqueado: iso(t) });
    for (const [id, t] of Object.entries(r.cursos ?? {})) cursos.push({ owner_hash: h, curso_id: id, completado: iso(t) });
  });
  result.pestle_logros = await send('pestle_logros', logros, 'owner_hash,logro_id', 'ignore');
  result.pestle_cursos_completados = await send('pestle_cursos_completados', cursos, 'owner_hash,curso_id', 'ignore');

  result.pestle_certificados = await send(
    'pestle_certificados',
    certs
      .filter(Boolean)
      .map((c) => ({
        id: c.id,
        owner_hash: c.ownerHash,
        nombre: c.name,
        curso_id: c.courseId,
        curso: c.courseTitle,
        nivel: c.level,
        lecciones: c.lessons,
        proyecto: c.projectTitle,
        proyecto_codigo: c.projectCode,
        emitido: iso(c.issuedAt as number),
      })),
    'id',
    'ignore'
  );

  result.pestle_codigos = await send(
    'pestle_codigos',
    pastes
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        owner_hash: p.ownerHash ?? null,
        titulo: p.title ?? null,
        contenido: p.content,
        lenguaje: p.language,
        publico: p.isPublic !== false,
        creado: iso(p.createdAt as number),
        vence: iso(p.expiresAt as number),
      })),
    'id',
    'ignore'
  );

  result.pestle_sugerencias = await send(
    'pestle_sugerencias',
    suggestions
      .filter((s) => s?.texto)
      .map((s) => ({ texto: s.texto, contacto: s.contacto || null, pagina: s.pagina || null, creado: s.fecha ?? now })),
    'creado,texto_md5',
    'ignore'
  );

  return json({ ok: true, copiado: result });
});
